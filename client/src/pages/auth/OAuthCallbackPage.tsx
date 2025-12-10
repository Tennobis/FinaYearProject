import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Get the token from URL params (sent by backend redirect)
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const errorMsg = searchParams.get('message');

        if (errorMsg) {
          setError(`OAuth error: ${errorMsg}`);
          return;
        }

        if (!token) {
          setError('No authentication token received');
          return;
        }

        // Store token and user data
        localStorage.setItem('authToken', token);
        if (userStr) {
          try {
            const user = JSON.parse(decodeURIComponent(userStr));
            localStorage.setItem('user', JSON.stringify(user));
          } catch {
            console.error('Failed to parse user data');
          }
        }
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Authenticating...</h1>
        
        {error ? (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            <p className="font-semibold">Authentication Failed</p>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p className="text-muted-foreground">Processing your login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
