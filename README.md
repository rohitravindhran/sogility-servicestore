# Sogility Service Store - WhiteLabel WebView App

A production-ready React Native (Expo) app that serves as a whitelabel WebView shell for multiple business service stores. The app dynamically loads business-specific themes, logos, and configurations while providing secure, offline-capable WebView functionality.

## Features

- 🏢 **Multi-Business Support**: Dynamic business selection with persistent preferences
- 🎨 **Dynamic Theming**: Business-specific colors, logos, and branding
- 🔒 **Security**: Host allowlisting and secure WebView navigation
- 🌐 **Offline Support**: Friendly offline screens with retry functionality
- 🔗 **Deep Linking**: Business-specific deep links (`myapp://open?biz=<id>`)
- 📱 **Native UX**: Hardware back button handling, splash screen, safe areas
- 🛠 **Debug Tools**: Development-only debug menu with logging and config refresh
- 🧪 **Well Tested**: Comprehensive unit tests for core logic

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run ios
npm run android
```

## Configuration

### Local Configuration (Fallback)

The app includes a bundled configuration file at `assets/businesses.json` that serves as a fallback when remote config is unavailable.

**Example `assets/businesses.json`:**

```json
[
  {
    "id": "acme",
    "displayName": "Acme Services",
    "primaryColor": "#1E90FF",
    "secondaryColor": "#0D47A1",
    "logoUrl": "https://example.com/logos/acme.png",
    "storeUrl": "https://acme.example.com/service-store",
    "allowedHosts": ["acme.example.com"],
    "customUserAgent": "AcmeApp/1.0",
    "status": "active"
  }
]
```

### Remote Configuration

The app automatically fetches configuration from a remote URL on startup. If remote fetch fails, it falls back to the bundled config.

**Remote Config URL**: Set in `services/ConfigService.ts` → `REMOTE_CONFIG_URL`

```typescript
const REMOTE_CONFIG_URL = 'https://config.sogility.com/businesses.json';
```

### Adding a New Business

1. **Update Local Fallback** (optional but recommended):
   ```bash
   # Edit the bundled configuration
   vim assets/businesses.json
   ```

2. **Update Remote Config**: Update your remote configuration endpoint with the new business entry.

3. **Test Configuration**:
   ```bash
   npm test  # Run validation tests
   npm start # Test in app
   ```

## Deep Linking

### Testing Deep Links

#### iOS Simulator
```bash
# Open specific business
xcrun simctl openurl booted "myapp://open?biz=acme"
```

#### Android Emulator
```bash
# Open specific business  
adb shell am start -W -a android.intent.action.VIEW -d "myapp://open?biz=acme" com.sogility.servicestore
```

## Debug Tools

### Accessing Debug Menu

In **development mode only**, long-press the header logo to open the debug menu.

**Debug Menu Features:**
- View current business configuration
- Refresh remote configuration
- Switch business selection
- Clear console logs
- View WebView console output

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Manual Verification Steps

1. **Splash Screen**: App should show splash until config loads
2. **Business Selection**: Shows business list if no saved selection
3. **Deep Links**: `myapp://open?biz=acme` opens Acme business directly
4. **Hardware Back**: Android back button navigates WebView history first
5. **External Links**: Links to non-allowed hosts open in system browser
6. **Offline Mode**: Turn off network → shows retry screen
7. **Config Refresh**: Long-press header logo → debug menu → refresh config
8. **Theme Adaptation**: Header text color adapts to business primary color

## Project Structure

```
sogility-servicestore/
├── app/                    # Main app entry point
├── assets/                 # Static assets and fallback config
├── components/            # React components
├── services/             # Business logic services
├── types/                # TypeScript type definitions
├── __tests__/           # Unit tests
└── jest.config.js       # Test configuration
```

## Security Features

- Host allowlisting for WebView navigation
- URL validation for business store URLs
- No remote JavaScript execution from config
- Secure AsyncStorage for user preferences

## Troubleshooting

**App crashes on startup**: Check `assets/businesses.json` format
**WebView not loading**: Verify `storeUrl` and `allowedHosts` configuration
**Deep links not working**: Verify URL scheme and business ID exists
**Images not loading**: Check `logoUrl` accessibility and network
