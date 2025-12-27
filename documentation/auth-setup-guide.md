# 🔐 Keycloak Authentication Setup Guide

**Stack**: Keycloak, NestJS, React (Vite), PostgreSQL, Docker  
**Realm**: `starting-kit-realm`  
**Frontend**: http://localhost:5173  
**Backend**: http://localhost:3000  

---

## 1️⃣ Architecture Overview

```

React (5173) ──► Keycloak ──► JWT
│                         │
└────────► NestJS (3000) ◄┘

````

- Keycloak → Authentication & Identity
- NestJS → Token validation & authorization
- React → Login & token usage

---

## 2️⃣ Prerequisites

- Docker & Docker Compose
- Running services:
  ```bash
  docker compose up
````

* Keycloak Admin Console available
* NestJS backend running
* React (Vite) frontend running

---

## 3️⃣ Keycloak Initial Setup

### 3.1 Access Admin Console

* URL: [http://localhost:8081](http://localhost:8081)
* Login:

  * **admin / admin**

---

### 3.2 Create Realm

1. Realm dropdown → **Create realm**
2. Settings:

   * Realm name: `starting-kit-realm`
   * Enabled: ON
3. Create

---

## 4️⃣ Realm Roles (IMPORTANT)

### 4.1 Create Realm Roles

Go to **Realm Roles → Create role**

Create:

* `user`
* `admin`

✔️ Realm roles are used for **authorization inside JWT**

---

## 5️⃣ Backend Client (Confidential)

### 5.1 Create Backend Client

**Clients → Create client**

**Basic settings**

* Client ID: `starting-kit-backend`
* Client type: OpenID Connect
* Client authentication: **ON**

**Capability config**

* Standard flow: OFF
* Direct access grants: OFF
* Service accounts roles: **ON**

✔️ Backend acts as a **resource server**

---

### 5.2 Assign Realm Roles to Backend Client

1. Open `starting-kit-backend`
2. Go to **Service account roles**
3. Select **Realm roles**
4. Assign:

   * `user`
   * `admin`

✔️ This allows backend to validate and understand roles

---

### 5.3 Client Secret

* Open **Credentials**
* Copy **Client Secret**

---

### 5.4 Backend `.env`

```env
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=starting-kit-realm
KEYCLOAK_CLIENT_ID=starting-kit-backend
KEYCLOAK_CLIENT_SECRET=your-secret
```

---

## 6️⃣ Frontend Client (Public – Vite)

### 6.1 Create Frontend Client

**Clients → Create client**

**Basic settings**

* Client ID: `starting-kit-frontend`
* Client authentication: OFF

**Capability config**

* Standard flow: ON
* Implicit flow: ❌ OFF
* Direct access grants: ❌ OFF

**Login settings**

* Valid redirect URIs:

  ```
  http://localhost:5173/*
  ```
* Web origins:

  ```
  http://localhost:5173
  ```

---

## 7️⃣ Users & Role Mapping

### 7.1 Create User

**Users → Create user**

* Username: `testuser`
* Email verified: ON

**Credentials**

* Set password
* Temporary: OFF

---

### 7.2 Assign Roles to User

1. Open user
2. Go to **Role mapping**
3. Assign realm roles:

   * `user`
   * `admin` (optional)

✔️ Roles will appear in JWT token

---

## 8️⃣ Token Configuration

**Realm settings → Tokens**

Recommended:

* Access token lifespan: **5 min**
* Refresh token lifespan: **30 min**

---

## 9️⃣ Get Token via Postman (VERY IMPORTANT)

### 9.1 Password Grant (Dev Only)

**POST**

```
http://localhost:8081/realms/starting-kit-realm/protocol/openid-connect/token
```

**Headers**

```
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded)**

```
grant_type=password
client_id=starting-kit-frontend
username=testuser
password=yourpassword
```

✅ Response contains:

* `access_token`
* `refresh_token`

---

### 9.2 Test Backend API

**GET**

```
http://localhost:3000/users/profile
```

**Headers**

```
Authorization: Bearer <ACCESS_TOKEN>
```

✔️ If valid → 200 OK
❌ If missing/invalid → 401 Unauthorized

---

## 10️⃣ NestJS Authorization Example

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
@Get('profile')
getProfile(@User() user) {
  return user;
}
```

---

## 11️⃣ React (Vite) Integration

### 11.1 Install

```bash
npm install keycloak-js @react-keycloak/web axios
```

---

### 11.2 Keycloak Config

```ts
const keycloak = new Keycloak({
  url: 'http://localhost:8081',
  realm: 'starting-kit-realm',
  clientId: 'starting-kit-frontend',
});
```

---

### 11.3 Provider

```tsx
<ReactKeycloakProvider authClient={keycloak}>
  <App />
</ReactKeycloakProvider>
```

---

### 11.4 Axios Token Injection

```ts
axios.interceptors.request.use(config => {
  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});
```

---

## 🔒 Security Rules Applied

✅ Authorization Code Flow
✅ Realm roles enforced server-side
✅ No implicit flow
✅ No direct access grants in production
✅ Backend validates every request

---

## 🧪 Final Verification Checklist

* [ ] Login via frontend works
* [ ] Token contains `realm_access.roles`
* [ ] Backend rejects unauthenticated calls
* [ ] Role-based endpoints enforced
* [ ] Postman test passes

---

## 🚀 Next Steps

* HTTPS everywhere
* Refresh token rotation
* Azure Keycloak deployment
* Environment-based realms

---

## ✅ Summary

This setup is:

* production-ready
* secure by default
* suitable for local & cloud
* aligned with Keycloak best practices

```

