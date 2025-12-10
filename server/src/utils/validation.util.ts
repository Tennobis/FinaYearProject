import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").min(1, "Password is required"),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const oauthSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  image: z.string().url().optional(),
  provider: z.enum(["google", "github"]),
  providerAccountId: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OAuthInput = z.infer<typeof oauthSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
