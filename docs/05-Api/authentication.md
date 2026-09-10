# Authentication API

## 1. Purpose

The Authentication API manages user authentication and session lifecycle for the Resume ↔ Job Description Analysis Platform.

The platform supports:

* Google authentication.
* Discord authentication.
* JWT-based application sessions.
* Current-user retrieval.
* Logout.
* Secure authentication state management.

The backend is responsible for validating external authentication credentials and creating the application's authenticated user session.

---

# 2. Base URL

All authentication endpoints are versioned under:

```text
/api/v1
```

Authentication endpoints use:

```text
/api/v1/auth
```

Example:

```text
POST https://api.example.com/api/v1/auth/google
```

All production API communication must use HTTPS.

---

# 3. Authentication Architecture

```text
Flutter Mobile App
        ↓
Google / Discord
        ↓
Provider Credential
        ↓
Node.js Backend
        ↓
Provider Verification
        ↓
Find/Create User
        ↓
Generate Application JWT
        ↓
Flutter App
        ↓
Secure Token Storage
```

The external provider authenticates the user.

The application backend establishes the application's own authenticated session.

---

# 4. Supported Providers

| Provider | Endpoint             | Credential                        |
| -------- | -------------------- | --------------------------------- |
| Google   | `POST /auth/google`  | Google ID token                   |
| Discord  | `POST /auth/discord` | Provider authorization credential |

The exact provider SDK/OAuth flow may vary between Flutter and backend implementations, but the backend must always verify the credential with the appropriate provider before creating a session.

---

# 5. Google Login

## Endpoint

```http
POST /api/v1/auth/google
```

## Headers

```http
Content-Type: application/json
```

## Request

```json
{
  "idToken": "<google_id_token>"
}
```

The backend must never trust user information supplied directly by the client.

It should obtain the verified identity from the Google credential.

---

# 6. Google Authentication Flow

```text
Flutter
   ↓
Google Sign-In
   ↓
Google ID Token
   ↓
POST /auth/google
   ↓
Backend verifies ID Token
   ↓
Extract verified Google identity
   ↓
Find existing user
      OR
Create new user
   ↓
Generate JWT
   ↓
Return authenticated session
```

The backend should validate:

* Token signature.
* Token expiration.
* Issuer.
* Audience/client ID.
* Provider user ID.
* Verified email status where required.

---

# 7. Google Login Request

```json
{
  "idToken": "eyJhbGciOi..."
}
```

The token is an example only and must never be hardcoded in the application.

---

# 8. Google Login Response

## HTTP 200 OK

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "66f111111111",
      "name": "Example User",
      "email": "user@example.com",
      "profileImage": "https://example.com/profile.jpg",
      "authProviders": [
        "google"
      ]
    },
    "accessToken": "<application_jwt>",
    "expiresIn": 3600
  },
  "message": "Google authentication successful"
}
```

---

# 9. Discord Login

## Endpoint

```http
POST /api/v1/auth/discord
```

## Request

```json
{
  "credential": "<discord_auth_credential>"
}
```

The credential must be obtained through the configured Discord OAuth flow.

The backend must verify the credential with Discord before creating the application session.

---

# 10. Discord Authentication Flow

```text
Flutter
   ↓
Discord OAuth
   ↓
Authorization Credential
   ↓
POST /auth/discord
   ↓
Backend verifies/exchanges credential
   ↓
Retrieve Discord user identity
   ↓
Find/Create User
   ↓
Generate JWT
   ↓
Return application session
```

The backend must not trust:

```text
name
email
discordId
profileImage
```

when supplied as arbitrary client-controlled fields.

These values should come from the verified Discord identity.

---

# 11. Discord Login Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "66f111111111",
      "name": "Example User",
      "email": "user@example.com",
      "profileImage": "https://example.com/profile.jpg",
      "authProviders": [
        "discord"
      ]
    },
    "accessToken": "<application_jwt>",
    "expiresIn": 3600
  },
  "message": "Discord authentication successful"
}
```

---

# 12. User Creation

When a user authenticates for the first time:

```text
Provider Authentication
        ↓
Provider User ID
        ↓
Search users.authProviders
        ↓
User exists?
   ├── Yes → Login
   └── No  → Create User
```

Example user structure:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "profileImage": "https://example.com/profile.jpg",
  "authProviders": [
    {
      "provider": "google",
      "providerUserId": "123456789"
    }
  ]
}
```

---

# 13. Account Linking

If the same user authenticates through multiple providers, the application may support linking them to the same account.

Example:

```text
Google
   ↓
User A
   ↑
Discord
```

Account linking must only occur when identity ownership has been securely verified.

The system must not merge accounts merely because two client requests contain the same email address.

---

# 14. Get Current User

## Endpoint

```http
GET /api/v1/auth/me
```

## Headers

```http
Authorization: Bearer <access_token>
```

## Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "66f111111111",
      "name": "Example User",
      "email": "user@example.com",
      "profileImage": "https://example.com/profile.jpg",
      "authProviders": [
        "google"
      ]
    }
  }
}
```

This endpoint is used by Flutter to restore the authenticated session when the application starts.

---

# 15. Logout

## Endpoint

```http
POST /api/v1/auth/logout
```

## Headers

```http
Authorization: Bearer <access_token>
```

## Response

```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

For a stateless JWT implementation, the Flutter application must remove the access token from secure storage.

If server-side token revocation is implemented, the backend should also revoke the corresponding session/token.

---

# 16. JWT Structure

The application access token may contain claims such as:

```json
{
  "sub": "66f111111111",
  "iat": 1789034400,
  "exp": 1789038000
}
```

Recommended claims:

| Claim | Purpose             |
| ----- | ------------------- |
| `sub` | Application user ID |
| `iat` | Token issued time   |
| `exp` | Token expiration    |

Do not store sensitive personal information inside JWT claims unnecessarily.

---

# 17. Protected API Requests

After login, Flutter sends:

```http
Authorization: Bearer <access_token>
```

Example:

```http
GET /api/v1/resumes
Authorization: Bearer eyJhbGciOi...
```

Backend flow:

```text
Request
   ↓
JWT Middleware
   ↓
Verify Signature
   ↓
Verify Expiration
   ↓
Extract User ID
   ↓
Attach req.user
   ↓
Controller
```

---

# 18. Authentication Middleware

Conceptually:

```text
authenticateRequest()
        ↓
Read Authorization header
        ↓
Extract Bearer token
        ↓
Verify JWT
        ↓
Load/resolve user
        ↓
req.user = authenticated user
```

If the token is invalid:

```text
401 Unauthorized
```

must be returned.

---

# 19. Authentication Error Responses

### Missing Token

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required",
    "details": []
  }
}
```

### Invalid Token

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired authentication token",
    "details": []
  }
}
```

### Provider Authentication Failure

```json
{
  "success": false,
  "error": {
    "code": "PROVIDER_AUTH_FAILED",
    "message": "Unable to authenticate with the selected provider",
    "details": []
  }
}
```

---

# 20. HTTP Status Codes

| Status | Meaning                          |
| -----: | -------------------------------- |
|    200 | Authentication successful        |
|    201 | User created                     |
|    400 | Invalid request                  |
|    401 | Authentication failed/required   |
|    403 | Access denied                    |
|    409 | Account conflict                 |
|    429 | Too many authentication attempts |
|    500 | Internal server error            |

---

# 21. Security Requirements

The authentication system must:

* Use HTTPS in production.
* Never store provider secrets in Flutter.
* Never trust client-supplied identity information.
* Validate provider credentials server-side.
* Use short-lived access tokens.
* Store tokens securely on the device.
* Rate-limit authentication endpoints.
* Avoid logging authentication tokens.
* Avoid logging provider credentials.
* Use secure environment variables.
* Never expose JWT signing secrets to the client.

---

# 22. Environment Variables

Example backend configuration:

```env
JWT_SECRET=<secure_random_secret>
JWT_EXPIRES_IN=1h

GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>

DISCORD_CLIENT_ID=<discord_client_id>
DISCORD_CLIENT_SECRET=<discord_client_secret>
DISCORD_REDIRECT_URI=<configured_redirect_uri>
```

Secrets must never be committed to Git.

---

# 23. Flutter Token Storage

The Flutter application should use secure platform storage.

Recommended:

```text
flutter_secure_storage
```

The access token must not be stored in:

* Plain SharedPreferences.
* Unencrypted files.
* Logs.
* Source code.

---

# 24. Session Restoration

When Flutter starts:

```text
App Launch
   ↓
Read secure token
   ↓
Token exists?
   ├── No → Login Screen
   └── Yes
        ↓
GET /auth/me
        ↓
Valid?
   ├── Yes → Home Screen
   └── No  → Clear token → Login
```

---

# 25. Authentication Architecture Summary

```text
              ┌──────────────┐
              │    Flutter   │
              └──────┬───────┘
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
       Google                 Discord
          │                     │
          └──────────┬──────────┘
                     ↓
              Node.js Backend
                     ↓
             Verify Provider
                     ↓
              User Repository
                     ↓
               MongoDB
                     ↓
                JWT Token
                     ↓
                 Flutter
```

---

# 26. Future Authentication Features

Potential future improvements:

* Refresh tokens.
* Session management.
* Account deletion.
* Provider account linking.
* Email/password authentication.
* Two-factor authentication.
* Device/session management.
* Suspicious-login detection.
* Token rotation.
