# Environment Configuration

This document explains how to configure and use environment variables in the Sogility Service Store app.

## Environment Files

The app uses different environment files for different deployment stages:

- `.env` - Default environment variables (development)
- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment
- `.env.local` - Local overrides (not committed to git)

## Available Environment Variables

All environment variables must be prefixed with `EXPO_PUBLIC_` to be available in the client-side code:

### Required Variables

- `EXPO_PUBLIC_APP_DOMAIN_NAME` - The app domain name (e.g., `.getomnify.com`)
- `EXPO_PUBLIC_APP_DOMAIN_HOST` - The app domain host URL (e.g., `https://app.getomnify.com`)
- `EXPO_PUBLIC_BASE_URL_API` - The base API URL (e.g., `https://api.getomnify.com/`)
- `EXPO_PUBLIC_BASE_URL_APP` - The base app URL (e.g., `https://app.getomnify.com/`)

### Optional Variables

- `EXPO_PUBLIC_BUSINESS_ID` - Pre-configured business ID for branded builds

## Usage in Code

### Using the Environment Service

```typescript
import { EnvironmentService, getUrls, getEnvironmentConfig } from '@/services/EnvironmentService';

// Get all URL configurations
const urls = getUrls();

// Get environment configuration
const config = getEnvironmentConfig();

// Access individual URLs
console.log(urls.getInfoForLogin); // https://app.getomnify.com/v2/apiv2/nonsession.json?method=getInfoForLogin

// Get environment details
const environmentService = EnvironmentService.getInstance();
console.log(environmentService.getEnvironment()); // 'development', 'staging', 'production', or 'unknown'
```

### Debug Configuration

To debug the current configuration:

```typescript
import { EnvironmentService } from '@/services/EnvironmentService';

const environmentService = EnvironmentService.getInstance();
environmentService.logConfig(); // Only logs in development mode
```

## Development Scripts

Use the following npm scripts for different environments:

### Standard Development
```bash
npm run start                    # Default development
npm run dev:sogility            # Sogility branded development  
npm run dev:hana                # Hana branded development
```

### Environment-Specific Development
```bash
npm run dev:staging             # Staging environment
npm run dev:production          # Production environment
```

### Platform-Specific Development
```bash
npm run android:sogility        # Android with Sogility branding
npm run ios:hana                # iOS with Hana branding
npm run android:staging         # Android with staging environment
npm run ios:production          # iOS with production environment
```

## Building with EAS

### Development Builds
```bash
eas build --platform all --profile development
```

### Staging Builds
```bash
eas build --platform all --profile staging
# OR
npm run build:staging
```

### Production Builds
```bash
# Generic production build
eas build --platform all --profile production
npm run build:production

# Branded production builds
npm run build:sogility          # Sogility branded production
npm run build:hana              # Hana branded production
```

## EAS Build Profiles

The `eas.json` file defines the following build profiles:

- `development` - Development client with dev environment URLs
- `staging` - Staging environment URLs
- `preview` - Preview builds with production URLs
- `production` - Production builds with production URLs
- `production-sogility` - Production build pre-configured for Sogility
- `production-hana` - Production build pre-configured for Hana

## Local Development Setup

1. Copy `.env.local` and customize for your local setup:
```bash
cp .env.local .env.local
# Edit .env.local with your local URLs if needed
```

2. Start development server:
```bash
npm run start
# OR for specific business
npm run dev:sogility
```

## Environment Priority

Environment variables are loaded in this order (highest priority first):

1. EAS build profile environment variables
2. Local `.env.local` file (not committed)
3. Environment-specific files (`.env.development`, `.env.staging`, etc.)
4. Default `.env` file
5. Hardcoded fallback values in `EnvironmentService`

## Security Notes

- Never commit sensitive data to `.env` files that are tracked by git
- Use `.env.local` for local development secrets
- Sensitive production values should be set in EAS build secrets or CI/CD environment
- All `EXPO_PUBLIC_` variables are bundled into the client app and are visible to users

## Troubleshooting

### Environment Variables Not Loading

1. Ensure variables are prefixed with `EXPO_PUBLIC_`
2. Restart the development server after changing `.env` files
3. Check the console output from `environmentService.logConfig()` in development
4. Verify the correct `.env` file is being loaded for your environment

### Build Issues

1. Ensure `app.config.js` is present (not just `app.json`)
2. Check that EAS build profile has the correct environment variables
3. Verify environment variable names match exactly in all config files

### URL Configuration Issues

1. Ensure URLs end with `/` where expected (API URLs)
2. Don't include trailing slashes for domain hosts
3. Check that all required endpoints are properly constructed in `EnvironmentService`

## Example Configuration

### Development (.env.development)
```env
EXPO_PUBLIC_APP_DOMAIN_NAME=.getomnify.com
EXPO_PUBLIC_APP_DOMAIN_HOST=https://dev-app.getomnify.com
EXPO_PUBLIC_BASE_URL_API=https://dev-api.getomnify.com/
EXPO_PUBLIC_BASE_URL_APP=https://dev-app.getomnify.com/
```

### Production (.env.production)
```env
EXPO_PUBLIC_APP_DOMAIN_NAME=.getomnify.com
EXPO_PUBLIC_APP_DOMAIN_HOST=https://app.getomnify.com
EXPO_PUBLIC_BASE_URL_API=https://api.getomnify.com/
EXPO_PUBLIC_BASE_URL_APP=https://app.getomnify.com/
```