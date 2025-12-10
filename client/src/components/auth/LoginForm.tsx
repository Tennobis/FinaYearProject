import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/contexts/AuthContext';
import { Github, Mail } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email');
        return;
      }

      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      // Fetch OAuth URLs from backend
      const response = await fetch(`${API_BASE_URL}/auth/oauth-urls`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to get OAuth URLs');
      }
      const { google } = await response.json();
      // Redirect to Google OAuth
      window.location.href = google;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    }
  };

  const handleGithubLogin = async () => {
    setError('');
    try {
      // Fetch OAuth URLs from backend
      const response = await fetch(`${API_BASE_URL}/auth/oauth-urls`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to get OAuth URLs');
      }
      const { github } = await response.json();
      // Redirect to GitHub OAuth
      window.location.href = github;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-input" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <Mail className="w-4 h-4" />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleGithubLogin}
          disabled={isLoading}
        >
          <Github className="w-4 h-4" />
          GitHub
        </Button>
      </div>
    </form>
  );
}
