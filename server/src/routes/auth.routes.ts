import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import * as authController from '../controllers/auth.controller';
import { getGoogleAuthUrl, getGithubAuthUrl } from '../utils/auth-urls.util';
import { 
  exchangeGoogleCode, 
  getGoogleUserProfile, 
  exchangeGithubCode, 
  getGithubUserProfile,
  getGithubUserEmail 
} from '../utils/oauth.util';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import prisma from '../config/prisma';

const router = Router();

// Helper to get env vars reliably
const getGoogleConfig = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/callback/google'
});

const getGithubConfig = () => ({
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:5001/api/auth/callback/github'
});

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * GET /api/auth/oauth-urls
 * Get OAuth authorization URLs for frontend
 */
router.get('/oauth-urls', (req, res) => {
  try {
    const google = getGoogleConfig();
    const github = getGithubConfig();

    if (!google.clientId || !github.clientId) {
      console.error('OAuth configuration missing:', { google: !!google.clientId, github: !!github.clientId });
      return res.status(500).json({ message: 'OAuth not configured' });
    }

    const googleAuthUrl = getGoogleAuthUrl(google.clientId, google.redirectUri);
    const githubAuthUrl = getGithubAuthUrl(github.clientId, github.redirectUri);

    return res.status(200).json({
      google: googleAuthUrl,
      github: githubAuthUrl,
    });
  } catch (error) {
    console.error('OAuth URLs error:', error);
    return res.status(500).json({ message: 'Failed to generate OAuth URLs' });
  }
});

/**
 * GET /api/auth/callback/google
 * Google OAuth callback
 */
router.get('/callback/google', async (req: AuthRequest, res: Response) => {
  const frontendUrl = getFrontendUrl();
  const config = getGoogleConfig();
  
  try {
    const { code } = req.query;
    console.log('Google callback received with code:', code ? 'present' : 'missing');

    if (!code || typeof code !== 'string') {
      return res.redirect(`${frontendUrl}/auth/error?message=No code provided`);
    }

    // Exchange code for tokens
    console.log('Exchanging Google code for tokens...');
    const tokenData = await exchangeGoogleCode(code, config.clientId, config.clientSecret, config.redirectUri);
    
    console.log('Fetching Google user profile...');
    const profile = await getGoogleUserProfile(tokenData.access_token);

    if (!profile.email) {
      console.error('No email in Google profile');
      return res.redirect(`${frontendUrl}/auth/error?message=No email provided by Google`);
    }

    // Find or create user
    console.log('Syncing user with database:', profile.email);
    let user = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name || null,
          image: profile.picture || null,
        },
      });
      console.log('Created new user:', user.id);
    }

    // Upsert account
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: profile.id,
        },
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: profile.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
      },
    });

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Redirect to frontend
    const userJson = encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    }));

    console.log('Authentication successful, redirecting to frontend');
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&user=${userJson}`);
  } catch (error) {
    console.error('Google callback error:', error);
    return res.redirect(`${frontendUrl}/auth/error?message=Authentication failed`);
  }
});

/**
 * GET /api/auth/callback/github
 * GitHub OAuth callback
 */
router.get('/callback/github', async (req: AuthRequest, res: Response) => {
  const frontendUrl = getFrontendUrl();
  const config = getGithubConfig();

  try {
    const { code } = req.query;
    console.log('GitHub callback received with code:', code ? 'present' : 'missing');

    if (!code || typeof code !== 'string') {
      return res.redirect(`${frontendUrl}/auth/error?message=No code provided`);
    }

    // Exchange code for tokens
    console.log('Exchanging GitHub code for tokens...');
    const tokenData = await exchangeGithubCode(code, config.clientId, config.clientSecret);
    
    console.log('Fetching GitHub user profile...');
    const profile = await getGithubUserProfile(tokenData.access_token);

    let email = profile.email;
    if (!email) {
      email = await getGithubUserEmail(tokenData.access_token);
    }

    if (!email) {
      console.error('No email in GitHub profile');
      return res.redirect(`${frontendUrl}/auth/error?message=No email provided by GitHub`);
    }

    // Find or create user
    console.log('Syncing user with database:', email);
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: profile.name || profile.login,
          image: profile.avatar_url || null,
        },
      });
      console.log('Created new user:', user.id);
    }

    // Upsert account
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "github",
          providerAccountId: profile.id.toString(),
        },
      },
      update: {
        accessToken: tokenData.access_token,
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "github",
        providerAccountId: profile.id.toString(),
        accessToken: tokenData.access_token,
      },
    });

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Redirect to frontend
    const userJson = encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    }));

    console.log('Authentication successful, redirecting to frontend');
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&user=${userJson}`);
  } catch (error) {
    console.error('GitHub callback error:', error);
    return res.redirect(`${frontendUrl}/auth/error?message=Authentication failed`);
  }
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/verify
 * Verify JWT token
 */
router.get('/verify', authMiddleware, authController.getCurrentUser);

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

// Refresh token route
router.post('/refresh-token', authController.refreshToken);

// Logout route
router.post('/logout', authController.logout);

// POST routes for frontend-managed OAuth
router.post('/google', authController.googleAuth);
router.post('/github', authController.githubAuth);

export default router;
