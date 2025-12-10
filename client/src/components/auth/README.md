# Authentication Components

This directory contains all authentication-related components and utilities.

## Components

### LoginForm
Email/password login form with OAuth options.

```tsx
import { LoginForm } from '@/components/auth/LoginForm';

function MyPage() {
  return (
    <LoginForm onSuccess={() => window.location.href = '/'} />
  );
}
```

### RegisterForm
User registration form with validation.

```tsx
import { RegisterForm } from '@/components/auth/RegisterForm';

function MyPage() {
  return (
    <RegisterForm onSuccess={() => window.location.href = '/'} />
  );
}
```

### ProtectedRoute
Higher-order component to protect routes that require authentication.

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Using the Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <>
      {isAuthenticated && <p>Welcome {user?.name}</p>}
      <button onClick={() => logout()}>Logout</button>
    </>
  );
}
```

## Auth Context API

### User Interface
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
```

### Available Methods
- `login(email: string, password: string): Promise<void>` - Login with email/password
- `register(email: string, password: string, name: string): Promise<void>` - Create new account
- `logout(): void` - Logout current user
- `loginWithGoogle(token: string): Promise<void>` - Login via Google OAuth
- `loginWithGithub(token: string): Promise<void>` - Login via GitHub OAuth

### Available State
- `user: User | null` - Current user object or null
- `isAuthenticated: boolean` - Whether user is logged in
- `isLoading: boolean` - Whether auth is being checked

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
VITE_API_URL=http://localhost:3001/api
```

3. Wrap your app with AuthProvider:
```tsx
import { AuthProvider } from '@/contexts/AuthContext';

<AuthProvider>
  <App />
</AuthProvider>
```

4. Use ProtectedRoute to guard authenticated pages:
```tsx
<Route
  path="/private"
  element={
    <ProtectedRoute>
      <PrivatePage />
    </ProtectedRoute>
  }
/>
```

## OAuth Setup (Optional)

### Google OAuth
1. Get Client ID from [Google Cloud Console](https://console.cloud.google.com/)
2. Install @react-oauth/google: `npm install @react-oauth/google`
3. Wrap app with GoogleOAuthProvider
4. Update LoginForm to use GoogleLogin component

### GitHub OAuth
1. Create OAuth app in [GitHub Settings](https://github.com/settings/developers)
2. Use GitHub's OAuth flow or library like `react-github-login`
3. Update LoginForm to use GitHub login component

## Token Management

Tokens are automatically:
- Stored in localStorage when user logs in
- Retrieved and sent with every API request via Axios interceptor
- Cleared when user logs out or receives 401 response
- Validated on app startup

## Error Handling

All authentication errors are caught and displayed to the user via error messages on the forms. They're also thrown as Error objects for programmatic handling.
