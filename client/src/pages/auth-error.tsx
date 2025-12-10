import { useNavigate } from 'react-router-dom';

/**
 * OAuth Error Page
 * Displays authentication errors and provides navigation options
 */
export default function AuthError() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const message = params.get('message') || 'Authentication failed';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-10V5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2h-6a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2h-6a2 2 0 01-2-2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
        <p className="text-gray-600 mb-6">{message}</p>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Try Again
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition mt-3"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
