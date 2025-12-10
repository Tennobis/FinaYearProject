import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * OAuth Callback Handler
 * This page handles OAuth redirects from Google and GitHub
 * It extracts tokens from query params and saves them for authenticated requests
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get tokens from URL query params
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');
        const userStr = params.get('user');

        if (!token || !userStr) {
          console.error('Missing authentication data');
          navigate('/auth/error?message=Missing authentication data');
          return;
        }

        const user = JSON.parse(userStr);

        // Save tokens (in production, use secure httpOnly cookies)
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken || '');
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect to dashboard or home
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth/error?message=Authentication failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing you in...</h1>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
