/**
 * Generate OAuth authorization URLs for client-side redirects
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';

export const getGoogleAuthUrl = (clientId: string, redirectUri: string, state?: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    ...(state && { state }),
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

export const getGithubAuthUrl = (clientId: string, redirectUri: string, state?: string, scope?: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope || 'user:email',
    ...(state && { state }),
  });

  return `${GITHUB_AUTH_URL}?${params.toString()}`;
};
