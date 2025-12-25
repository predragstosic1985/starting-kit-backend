# Keycloak Authentication Setup Guide

**Date**: 2025-12-25
**Context**: Setting up Keycloak authentication for NestJS backend and React frontend
**Based on**: Constitution security principles, existing Keycloak integration in codebase

## Overview

This guide provides step-by-step instructions for configuring Keycloak authentication to secure your Starting Kit Backend Platform and integrate with a React frontend. The setup follows the constitution's security-first approach using Keycloak for authentication and authorization.

## Prerequisites

- Docker and Docker Compose installed
- Starting Kit Backend running (via `docker-compose up`)
- React frontend repository ready for integration
- Basic understanding of OAuth2/OpenID Connect flows

## Architecture Overview

```
Frontend (React) ←→ Backend (NestJS) ←→ Keycloak Server
     ↓                    ↓                    ↓
   JWT Tokens      Bearer Auth         User Management
   API Calls       Protected Routes    Realms/Clients
```

## Part 1: Keycloak Server Configuration

### Step 1: Access Keycloak Admin Console

1. Start your services: `docker-compose up`
2. Open browser to: `http://localhost:8081`
3. Login with:
   - **Username**: `admin`
   - **Password**: `admin`

### Step 2: Create a New Realm

1. Click **"Master"** dropdown (top-left) → **"Create realm"**
2. Enter realm details:
   - **Realm name**: `starting-kit-realm`
   - **Enabled**: ON
   - **Display name**: `Starting Kit Platform`
3. Click **"Create"**

### Step 3: Configure Realm Settings

1. Go to **"Realm settings"** → **"Login"** tab
2. Configure login settings:
   - **User registration**: ON (if you want self-registration)
   - **Login with email**: ON
   - **Verify email**: OFF (for development)
   - **Reset password**: ON

### Step 4: Create a Client for Backend

1. Go to **"Clients"** → **"Create client"**
2. Basic settings:
   - **Client ID**: `starting-kit-backend`
   - **Client type**: `OpenID Connect`
   - **Client authentication**: ON
3. Click **"Next"**
4. Capability config:
   - **Standard flow**: ON
   - **Direct access grants**: ON
5. Click **"Next"**
6. Login settings:
   - **Valid redirect URIs**: `http://localhost:3000/*`
   - **Web origins**: `http://localhost:3000`
7. Click **"Save"**

### Step 5: Configure Client Credentials

1. In client settings → **"Credentials"** tab
2. Note the **"Client secret"** (copy this value)
3. Update your `.env` file:
   ```
   KEYCLOAK_REALM=starting-kit
   KEYCLOAK_URL=http://localhost:8080
   KEYCLOAK_CLIENT_ID=starting-kit-backend
   KEYCLOAK_CLIENT_SECRET=<your-client-secret>
   ```

### Step 6: Create a Client for Frontend

1. Go to **"Clients"** → **"Create client"**
2. Basic settings:
   - **Client ID**: `starting-kit-frontend`
   - **Client type**: `OpenID Connect`
   - **Client authentication**: OFF
3. Click **"Next"**
4. Capability config:
   - **Standard flow**: ON
   - **Direct access grants**: OFF
5. Click **"Next"**
6. Login settings:
   - **Valid redirect URIs**: `http://localhost:3001/*` (adjust port for your frontend)
   - **Web origins**: `http://localhost:3001`
7. Click **"Save"**

### Step 7: Create Users and Roles

1. Go to **"Users"** → **"Create new user"**
2. Create test users:
   - **Username**: `testuser`
   - **Email**: `test@example.com`
   - **First name**: `Test`
   - **Last name**: `User`
   - **Email verified**: ON
3. Go to **"Credentials"** tab → Set password
4. Create roles in **"Realm roles"**:
   - `user` (default role)
   - `admin` (admin role)

### Step 8: Configure Token Settings

1. Go to **"Realm settings"** → **"Tokens"** tab
2. Adjust token lifetimes (optional):
   - **Access token lifespan**: 5 minutes
   - **Refresh token lifespan**: 30 minutes

## Part 2: Backend Configuration (NestJS)

### Current Setup Analysis

Your backend already has basic Keycloak integration:
- `AuthModule` with `KeycloakStrategy`
- Passport integration
- Environment variables configured

### Step 1: Update Environment Variables

Ensure your `.env` file has:
```
KEYCLOAK_REALM=starting-kit
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_CLIENT_ID=starting-kit-backend
KEYCLOAK_CLIENT_SECRET=<from-keycloak>
```

### Step 2: Enhance Keycloak Strategy

The current strategy is basic. For production, consider:

```typescript
// src/auth/keycloak.strategy.ts
async validate(payload: any, done: (err: any, user: any) => void) {
  try {
    // Extract user info from JWT payload
    const user = {
      id: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
      roles: payload.realm_access?.roles || [],
      name: payload.name,
    };
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}
```

### Step 3: Add Guards and Decorators

Create authentication guards:

```typescript
// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('keycloak') {}
```

```typescript
// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}
```

### Step 4: Create Custom Decorators

```typescript
// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// src/auth/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Step 5: Protect Routes

Update your user controller:

```typescript
// src/modules/users/user.controller.ts
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  // ... existing code

  @Get('profile')
  @Roles('user')
  getProfile(@User() user) {
    return user;
  }

  @Get()
  @Roles('admin')
  findAll() {
    // Only admins can list all users
    return this.userService.findAll();
  }
}
```

### Step 6: Update Auth Module

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from './keycloak.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'keycloak' })],
  providers: [KeycloakStrategy, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
```

## Part 3: Frontend Configuration (React)

### Step 1: Install Dependencies

```bash
npm install @react-keycloak/web keycloak-js axios
```

### Step 2: Create Keycloak Configuration

```javascript
// src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'starting-kit',
  clientId: 'starting-kit-frontend',
});

export default keycloak;
```

### Step 3: Wrap App with Keycloak Provider

```javascript
// src/index.js or src/App.js
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';

function App() {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      }}
    >
      <YourApp />
    </ReactKeycloakProvider>
  );
}
```

### Step 4: Create Authentication Components

```javascript
// src/components/AuthButton.js
import { useKeycloak } from '@react-keycloak/web';

const AuthButton = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <div>Loading...</div>;

  return (
    <div>
      {!keycloak.authenticated ? (
        <button onClick={() => keycloak.login()}>Login</button>
      ) : (
        <div>
          <p>Welcome, {keycloak.tokenParsed?.preferred_username}</p>
          <button onClick={() => keycloak.logout()}>Logout</button>
        </div>
      )}
    </div>
  );
};
```

### Step 5: Configure API Client

```javascript
// src/api/client.js
import axios from 'axios';
import { useKeycloak } from '@react-keycloak/web';

const useApiClient = () => {
  const { keycloak } = useKeycloak();

  const client = axios.create({
    baseURL: 'http://localhost:3000',
  });

  // Add JWT token to requests
  client.interceptors.request.use(config => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  });

  // Handle token refresh
  client.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        keycloak.logout();
      }
      return Promise.reject(error);
    }
  );

  return client;
};
```

### Step 6: Protect Routes

```javascript
// src/components/PrivateRoute.js
import { useKeycloak } from '@react-keycloak/web';

const PrivateRoute = ({ children, roles = [] }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <div>Loading...</div>;

  if (!keycloak.authenticated) {
    keycloak.login();
    return null;
  }

  // Check roles if specified
  if (roles.length > 0) {
    const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));
    if (!hasRole) {
      return <div>Access denied</div>;
    }
  }

  return children;
};
```

### Step 7: Create Silent SSO Check File

Create `public/silent-check-sso.html`:

```html
<html>
<body>
<script>
  parent.postMessage(location.href, location.origin);
</script>
</body>
</html>
```

## Part 4: Testing the Integration

### Step 1: Test Backend Authentication

1. Start backend: `yarn start:dev`
2. Get access token from Keycloak
3. Test protected endpoint:
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:3000/users/profile
   ```

### Step 2: Test Frontend Authentication

1. Start frontend: `npm start`
2. Click login → Should redirect to Keycloak
3. Login with test user
4. Should return to app with authenticated state

### Step 3: Test Role-Based Access

1. Create user with admin role in Keycloak
2. Test admin-only endpoints
3. Verify role guards work

## Security Considerations

### Production Checklist

- [ ] Enable HTTPS everywhere
- [ ] Use proper token validation
- [ ] Configure proper CORS policies
- [ ] Set appropriate token lifetimes
- [ ] Enable email verification
- [ ] Configure password policies
- [ ] Use environment-specific configurations

### Best Practices

1. **Token Storage**: Use HttpOnly cookies for refresh tokens
2. **Token Refresh**: Implement automatic token refresh
3. **Logout**: Implement proper logout flow
4. **Error Handling**: Handle authentication errors gracefully
5. **Security Headers**: Implement proper security headers

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check Keycloak client redirect URIs
2. **Token Expired**: Implement token refresh logic
3. **Role Not Working**: Check role mapping in Keycloak
4. **Login Loop**: Verify client configuration

### Debug Tips

- Check browser network tab for API calls
- Use Keycloak admin console to inspect tokens
- Enable debug logging in both frontend and backend

## Next Steps

1. Implement user profile management
2. Add social login providers
3. Configure multi-factor authentication
4. Set up user registration flow
5. Implement password reset functionality

---

**Note**: This guide follows the Starting Kit Constitution's security principles and provides a production-ready authentication setup. All configurations should be reviewed and adjusted for your specific security requirements.