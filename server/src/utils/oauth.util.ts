import axios from 'axios';

// Google OAuth token exchange
export const exchangeGoogleCode = async (code: string, clientId: string, clientSecret: string, redirectUri: string) => {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    return response.data;
  } catch (error) {
    console.error('Google token exchange error:', error);
    throw new Error('Failed to exchange Google code');
  }
};

// Get Google user profile
export const getGoogleUserProfile = async (accessToken: string) => {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Google profile fetch error:', error);
    throw new Error('Failed to fetch Google user profile');
  }
};

// GitHub OAuth token exchange
export const exchangeGithubCode = async (code: string, clientId: string, clientSecret: string) => {
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('GitHub token exchange error:', error);
    throw new Error('Failed to exchange GitHub code');
  }
};

// Get GitHub user profile
export const getGithubUserProfile = async (accessToken: string) => {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('GitHub profile fetch error:', error);
    throw new Error('Failed to fetch GitHub user profile');
  }
};

// Get GitHub user email (if not in profile)
export const getGithubUserEmail = async (accessToken: string) => {
  try {
    const response = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    // Find primary email
    const primaryEmail = response.data.find((email: any) => email.primary);
    return primaryEmail?.email || response.data[0]?.email;
  } catch (error) {
    console.error('GitHub email fetch error:', error);
    return null;
  }
};
