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

// OAuth configuration from environment
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/callback/google';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5001/api/auth/callback/github';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * GET /api/auth/oauth-urls
 * Get OAuth authorization URLs for frontend
 */
router.get('/oauth-urls', (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID || !GITHUB_CLIENT_ID) {
      return res.status(500).json({ message: 'OAuth not configured' });
    }

    const googleAuthUrl = getGoogleAuthUrl(GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI);
    const githubAuthUrl = getGithubAuthUrl(GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI);

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
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.redirect(`${FRONTEND_URL}/auth/error?message=No code provided`);
    }

    // Exchange code for tokens
    const tokenData = await exchangeGoogleCode(code, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    const profile = await getGoogleUserProfile(tokenData.access_token);

    if (!profile.email) {
      return res.redirect(`${FRONTEND_URL}/auth/error?message=No email provided by Google`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name || null,
          image: profile.picture || null,
          emailVerified: true,
        },
      });
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

    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&user=${userJson}`);
  } catch (error) {
    console.error('Google callback error:', error);
    return res.redirect(`${FRONTEND_URL}/auth/error?message=Authentication failed`);
  }
});

/**
 * GET /api/auth/callback/github
 * GitHub OAuth callback
 */
router.get('/callback/github', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.redirect(`${FRONTEND_URL}/auth/error?message=No code provided`);
    }

    // Exchange code for tokens
    const tokenData = await exchangeGithubCode(code, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
    const profile = await getGithubUserProfile(tokenData.access_token);

    let email = profile.email;
    if (!email) {
      email = await getGithubUserEmail(tokenData.access_token);
    }

    if (!email) {
      return res.redirect(`${FRONTEND_URL}/auth/error?message=No email provided by GitHub`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: profile.name || profile.login,
          image: profile.avatar_url || null,
          emailVerified: true,
        },
      });
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

    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&user=${userJson}`);
  } catch (error) {
    console.error('GitHub callback error:', error);
    return res.redirect(`${FRONTEND_URL}/auth/error?message=Authentication failed`);
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

// POST routes for frontend-managed OAuth
router.post('/google', authController.googleAuth);
router.post('/github', authController.githubAuth);

export default router;
