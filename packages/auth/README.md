# @twapi/auth

This package is a basic twitch auth provider. This package is used by other twapi packages to authenticate.

Features

- Automatically refreshes user access token
- Fetches new app access token on expiration
- Gets user id and user name from token

## Documentation

Read our [documentation](https://twapi-docs.vercel.app/auth/quickstart) for the auth package

## Quickstart

#### 1. Add the following dependency

```bash
pnpm add @twapi/auth
```

#### 2. Create new Credentials

```javascript
const credentials = new Credentials(
  oauthToken,
  clientId,
  clientSecret,
  refreshToken
);
// Refresh token is optional
```

#### 3. Instantiate Auth Provider

```js
const authProvider = new AuthProvider(credentials);

// Get user access token
console.log(await authProvider.getUserAccessToken());

// Get User Id or User name
console.log(await authProvider.getUserId());
// This is asynchronous as it waits for access token validation
```
