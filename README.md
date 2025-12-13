# Starting Kit Backend Platform

A modern, elegant, and scalable backend starting kit built with NestJS, designed for any new application. Features clean architecture, high configurability, security with Keycloak, and seamless device compatibility.

## Features

- **Elegant & Modern**: Clean code structure with latest TypeScript
- **Highly Configurable**: Environment-based configuration for adaptability
- **Secure**: Keycloak integration for authentication and authorization
- **Scalable**: PostgreSQL database with TypeORM for data management
- **Device Compatible**: RESTful APIs working across all devices
- **Tested**: Comprehensive unit, e2e, and smoke tests
- **Containerized**: Docker support for easy deployment

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn 4+
- Docker (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Copy environment file:
   ```bash
   cp .env.example .env
   ```
4. Configure your environment variables in `.env`

### Running the Application

#### Development
```bash
yarn run start:dev
```

#### Production
```bash
yarn run build
yarn run start:prod
```

#### With Docker
```bash
docker-compose up
```

### Testing

```bash
# Unit tests
yarn run test

# E2e tests
yarn run test:e2e

# Smoke tests
yarn run test:smoke
```

## API Endpoints

- `GET /health` - Health check endpoint

## Configuration

Configure the application using environment variables:

- `PORT` - Application port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `KEYCLOAK_URL` - Keycloak server URL
- `KEYCLOAK_REALM` - Keycloak realm
- `KEYCLOAK_CLIENT_ID` - Keycloak client ID
- `KEYCLOAK_CLIENT_SECRET` - Keycloak client secret

## Architecture

- **Controllers**: Handle HTTP requests
- **Services**: Business logic
- **Entities**: Database models
- **Modules**: Feature organization
- **Guards**: Authentication protection
- **DTOs**: Data transfer objects

## Contributing

1. Follow the constitution principles
2. Write tests for new features
3. Ensure code quality with linting
4. Update documentation

## License

This project is licensed under the MIT License.
