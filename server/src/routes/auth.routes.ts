import { Router, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { AuthRequest, authMiddleware } from '../middlewares/auth.middleware';
import { 
  exchangeGoogleCode, 
  getGoogleUserProfile, 
  exchangeGithubCode, 
  getGithubUserProfile,
  getGithubUserEmail 
} from '../utils/oauth.util';
import { getGoogleAuthUrl, getGithubAuthUrl } from '../utils/auth-urls.util';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';

const router = Router();

// Mock database - replace with actual database
const users: Map<string, any> = new Map();

// OAuth configuration from environment
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/callback/google';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5001/api/auth/callback/github';

// Helper function to generate tokens
function generateToken(userId: string, email: string, name: string): string {
  return generateAccessToken(userId, email);
}

/**
 * GET /api/auth/oauth-urls
 * Get OAuth authorization URLs for frontend
 */
router.get('/oauth-urls', (req: AuthRequest, res: Response) => {
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
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    if (users.has(email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const userId = Date.now().toString(); // Replace with uuid in production
    const user = {
      id: userId,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
    };

    users.set(email, user);

    // Generate token
    const token = generateToken(userId, email, name);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.name);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
});

/**
 * GET /api/auth/verify
 * Verify JWT token
 */
router.get('/verify', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json({
      valid: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

/**
 * GET /api/auth/callback/google
 * Google OAuth callback - exchange code for token
 */
router.get('/callback/google', async (req: AuthRequest, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth credentials not configured');
      return res.status(500).json({ message: 'Google OAuth not configured' });
    }

    // Exchange code for access token
    const tokenData = await exchangeGoogleCode(code, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    
    if (!tokenData.access_token) {
      return res.status(400).json({ message: 'Failed to obtain access token' });
    }

    // Fetch user profile
    const profile = await getGoogleUserProfile(tokenData.access_token);

    if (!profile.email) {
      return res.status(400).json({ message: 'Email not available from Google' });
    }

    // Check if user exists
    let user = users.get(profile.email);

    if (!user) {
      // Create new user
      const userId = Date.now().toString();
      user = {
        id: userId,
        email: profile.email,
        name: profile.name || 'Google User',
        googleId: profile.id,
        provider: 'google',
        createdAt: new Date(),
      };
      users.set(profile.email, user);
    } else {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = profile.id;
      }
    }

    // Generate JWT token
    const authToken = generateToken(user.id, user.email, user.name);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Redirect to frontend with tokens (in production, use secure httpOnly cookies)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${authToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    }))}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/error?message=Google authentication failed`);
  }
});

/**
 * POST /api/auth/google
 * Legacy endpoint - accept token from client (for testing)
 */
router.post('/google', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token required' });
    }

    // In production, verify token with Google
    // const payload = await verifyGoogleToken(token);
    // For now, mock verification
    const payload = {
      sub: 'google_user_id',
      email: 'user@gmail.com',
      name: 'Google User',
    };

    let user = users.get(payload.email);

    if (!user) {
      // Create new user from Google OAuth
      const userId = Date.now().toString();
      user = {
        id: userId,
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        createdAt: new Date(),
      };
      users.set(payload.email, user);
    }

    const authToken = generateToken(user.id, user.email, user.name);

    return res.status(200).json({
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ message: 'Google authentication failed' });
  }
});

/**
 * GET /api/auth/callback/github
 * GitHub OAuth callback - exchange code for token
 */
router.get('/callback/github', async (req: AuthRequest, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      console.error('GitHub OAuth credentials not configured');
      return res.status(500).json({ message: 'GitHub OAuth not configured' });
    }

    // Exchange code for access token
    const tokenData = await exchangeGithubCode(code, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
    
    if (!tokenData.access_token) {
      return res.status(400).json({ message: 'Failed to obtain access token' });
    }

    // Fetch user profile
    const profile = await getGithubUserProfile(tokenData.access_token);

    // Get email if not in profile
    let email = profile.email;
    if (!email) {
      email = await getGithubUserEmail(tokenData.access_token);
    }

    if (!email) {
      return res.status(400).json({ message: 'Email not available from GitHub' });
    }

    // Check if user exists
    let user = users.get(email);

    if (!user) {
      // Create new user
      const userId = Date.now().toString();
      user = {
        id: userId,
        email: email,
        name: profile.name || profile.login,
        githubId: profile.id,
        githubLogin: profile.login,
        provider: 'github',
        createdAt: new Date(),
      };
      users.set(email, user);
    } else {
      // Update existing user with GitHub ID if not set
      if (!user.githubId) {
        user.githubId = profile.id;
        user.githubLogin = profile.login;
      }
    }

    // Generate JWT token
    const authToken = generateToken(user.id, user.email, user.name);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Redirect to frontend with tokens (in production, use secure httpOnly cookies)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${authToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    }))}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/error?message=GitHub authentication failed`);
  }
});

/**
 * POST /api/auth/github
 * Legacy endpoint - accept token from client (for testing)
 */
router.post('/github', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'GitHub token required' });
    }

    // In production, verify token with GitHub
    // const profile = await getGithubUserProfile(token);
    // For now, mock verification
    const profile = {
      id: 'github_user_id',
      login: 'github_user',
      name: 'GitHub User',
      email: 'user@github.com',
    };

    let user = users.get(profile.email || profile.login);

    if (!user) {
      // Create new user from GitHub OAuth
      const userId = Date.now().toString();
      user = {
        id: userId,
        email: profile.email || `${profile.login}@github.local`,
        name: profile.name || profile.login,
        githubId: profile.id,
        createdAt: new Date(),
      };
      users.set(user.email, user);
    }

    const authToken = generateToken(user.id, user.email, user.name);

    return res.status(200).json({
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    return res.status(500).json({ message: 'GitHub authentication failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = users.get(req.user?.email || '');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get user' });
  }
});

export default router;
