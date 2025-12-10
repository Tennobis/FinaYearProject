import { Router, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { AuthRequest, authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Mock database - replace with actual database
const users: Map<string, any> = new Map();

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
 * POST /api/auth/google
 * Login/register with Google OAuth
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
 * POST /api/auth/github
 * Login/register with GitHub OAuth
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
