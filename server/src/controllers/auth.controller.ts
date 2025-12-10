import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.util";
import {
  registerSchema,
  loginSchema,
  oauthSchema,
  refreshTokenSchema,
  RegisterInput,
  LoginInput,
  OAuthInput,
  RefreshTokenInput,
} from "../utils/validation.util";
import { AuthRequest } from "../middlewares/auth.middleware";

const prisma = new PrismaClient();

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: string;
  };
}

// Register a new user with email/password
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name || null,
        emailVerified: true, // Set to true for now, implement email verification later
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login with email/password
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Google OAuth callback
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = oauthSchema.parse({
      ...req.body,
      provider: "google",
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name || null,
          image: input.image || null,
          emailVerified: true,
        },
      });
    }

    // Create or update account
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: input.providerAccountId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: input.providerAccountId,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// GitHub OAuth callback
export const githubAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = oauthSchema.parse({
      ...req.body,
      provider: "github",
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name || null,
          image: input.image || null,
          emailVerified: true,
        },
      });
    }

    // Create or update account
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "github",
          providerAccountId: input.providerAccountId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: "oauth",
        provider: "github",
        providerAccountId: input.providerAccountId,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Refresh JWT token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const input = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const payload = verifyRefreshToken(input.refreshToken);

    if (!payload) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken(payload.userId, payload.email);

    // Optionally generate new refresh token (rotating refresh tokens for better security)
    const newRefreshToken = generateRefreshToken(payload.userId, payload.email);

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current user profile
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
