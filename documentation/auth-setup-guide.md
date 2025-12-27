# 🔐 Keycloak Authentication Setup Guide

**Context**: Authentication & authorization setup for NestJS backend and React frontend
**Stack**: Keycloak, NestJS, React, PostgreSQL, Docker
**Realm**: `starting-kit-realm`

---

## 1️⃣ Overview

This guide provides a **clear, step-by-step** setup for Keycloak authentication using **OpenID Connect (OIDC)**.

### Architecture

```
React Frontend ──► Keycloak ──► JWT
│                          │
└────────► NestJS Backend ◄┘
```

- Keycloak handles authentication and identity management
- Backend validates JWT tokens and enforces authorization
- Frontend uses OAuth2 Authorization Code Flow

---

## 2️⃣ Prerequisites

- Docker & Docker Compose installed
- Infrastructure running:
  ```bash
  docker compose up
  ```
- NestJS backend available
- React frontend available
- Basic understanding of OAuth2 / OpenID Connect

---

## 3️⃣ Keycloak Server Setup

### 3.1 Access Admin Console

- **URL**: `http://localhost:8081`
- **Credentials**:
  - Username: `admin`
  - Password: `admin`

### 3.2 Create Realm

1. Open realm dropdown → Create realm
2. Set:
   - Realm name: `starting-kit-realm`
   - Enabled: `ON`
3. Click **Create**

✔️ This realm is shared by backend and frontend.

### 3.3 Realm Login Settings (Development)

1. Navigate to **Realm settings → Login**
2. Configure:
   - User registration: `optional`
   - Login with email: `ON`
   - Verify email: `OFF` (development only)
   - Reset password: `ON`

---

## 4️⃣ Backend Client Configuration

### 4.1 Create Backend Client

1. Navigate to **Clients → Create client**
2. **Basic settings**:
   - Client ID: `starting-kit-backend`
   - Client type: `OpenID Connect`
   - Client authentication: `ON`
3. **Capability config**:
   - Standard flow: `ON`
   - Direct access grants: `OFF`
4. **Login settings**:
   - Valid redirect URIs: (leave empty)
   - Web origins: (leave empty)

✔️ Backend is a confidential client.

### 4.2 Client Secret

1. Open client → **Credentials**
2. Copy the **Client Secret**

### 4.3 Backend Environment Variables

```env
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=starting-kit-realm
KEYCLOAK_CLIENT_ID=starting-kit-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

---

## 5️⃣ Frontend Client Configuration

### 5.1 Create Frontend Client

1. Navigate to **Clients → Create client**
2. **Basic settings**:
   - Client ID: `starting-kit-frontend`
   - Client authentication: `OFF`
   - Client type: `OpenID Connect`
3. **Capability config**:
   - Standard flow: `ON`
   - Implicit flow: `OFF`
   - Direct access grants: `OFF`
4. **Login settings**:
   - Valid redirect URIs:
     ```
     http://localhost:3001/*
     ```
   - Web origins:
     ```
     http://localhost:3001
     ```

✔️ Frontend is a public client.

---

## 6️⃣ Roles & Users

### 6.1 Create Realm Roles

- `user`
- `admin`

### 6.2 Create Test User

1. Navigate to **Users → Create user**
2. Set:
   - Username: `testuser`
   - Email verified: `ON`
3. **Credentials**:
   - Set password
   - Temporary: `OFF`
4. **Role mapping**:
   - Assign `user` role

---

## 7️⃣ Token Configuration

1. Navigate to **Realm settings → Tokens**
2. Recommended for development:
   - Access token lifespan: `5 minutes`
   - Refresh token lifespan: `30 minutes`

---

## 8️⃣ NestJS Backend Integration

### 8.1 JWT Validation Strategy

```typescript
validate(payload: any) {
  return {
    id: payload.sub,
    username: payload.preferred_username,
    email: payload.email,
    roles: payload.realm_access?.roles ?? [],
  };
}
```

### 8.2 Guards

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('keycloak') {}
```

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!roles) return true;

    const user = ctx.switchToHttp().getRequest().user;
    return roles.some(r => user.roles?.includes(r));
  }
}
```

### 8.3 Protect Routes

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
@Get('profile')
getProfile(@User() user) {
  return user;
}
```

---

## 9️⃣ React Frontend Integration

### 9.1 Install Dependencies

```bash
npm install keycloak-js @react-keycloak/web axios
```

### 9.2 Keycloak Configuration

```typescript
const keycloak = new Keycloak({
  url: 'http://localhost:8081',
  realm: 'starting-kit-realm',
  clientId: 'starting-kit-frontend',
});
```

### 9.3 Provider Setup

```tsx
<ReactKeycloakProvider authClient={keycloak}>
  <App />
</ReactKeycloakProvider>
```

### 9.4 API Client

```typescript
client.interceptors.request.use(config => {
  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});
```

---

## 🔒 Security Best Practices

- Authorization Code Flow only
- No implicit flow
- No direct access grants
- Backend uses confidential client
- Roles validated on backend

---

## 🧪 Testing Checklist

- Login via frontend
- JWT present in API requests
- Backend blocks unauthenticated access
- Role-based access works correctly

---

## 🚀 Next Steps

- Enable HTTPS
- Implement token refresh handling
- Environment-based configuration
- Deploy Keycloak with persistent storage

---

## ✅ Final Notes

This setup is:

- Production-aligned
- Secure by default
- Suitable for local and cloud deployments
- Easy to maintain and extend

---
