# Changelog

All notable changes to the Sogility Service Store project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-07

### Added

#### WhiteLabel WebView Shell
- **Multi-Business Support**: Dynamic business selection and management system
- **Configuration System**: Local fallback (`assets/businesses.json`) with remote config fetching
- **Business Selection Screen**: Polished onboarding UI with logo preview and "Open Store" CTA
- **Persistent Preferences**: Business selection saved to AsyncStorage for seamless app restart experience

#### WebView Integration
- **react-native-webview**: Secure WebView shell with host allowlisting
- **Navigation Control**: External links automatically open in system browser when outside allowed hosts
- **Custom User Agent**: App identifier with optional business-specific user agent strings
- **JavaScript Injection**: Page title capture and external link interception
- **Message Handling**: Bidirectional communication between WebView and React Native

#### Security Features
- **Host Allowlisting**: Strict navigation control based on business configuration
- **URL Validation**: Sanitized business store URLs with protocol enforcement (HTTP/HTTPS only)
- **Configuration Validation**: Comprehensive business config validation with error reporting
- **No Remote Code Execution**: Configuration is data-only, no remote JavaScript execution

#### Deep Linking System
- **Custom Scheme**: `myapp://open?biz=<business-id>` for direct business access
- **URL Parsing**: Robust deep link parsing with business ID extraction
- **Auto-Selection**: Deep links override saved business selection and open immediately
- **Universal Link Support**: Framework for production universal/app links configuration

#### User Experience
- **Splash Screen**: `expo-splash-screen` integration with asset preloading
- **Logo Preloading**: Business logos cached during splash screen using `expo-asset`
- **Dynamic Theming**: Business-specific header colors with automatic text color adaptation
- **Safe Area Support**: Proper status bar and safe area handling across platforms
- **Hardware Back Button**: Android back button navigates WebView history before app exit

#### Offline & Error Handling
- **Offline Detection**: Friendly offline screens with retry functionality
- **Network Error Recovery**: Graceful handling of DNS, timeout, and connectivity errors
- **Config Fallback**: Automatic fallback to bundled config when remote fetch fails
- **Error Classification**: User-friendly error messages based on error types

#### Debug & Development Tools
- **Debug Menu**: Development-only debug interface (long-press header logo)
- **Console Logging**: WebView console capture and display in debug menu
- **Config Refresh**: Manual remote config refresh functionality
- **Business Switching**: Quick business selection switching from debug menu
- **Error Reporting**: Detailed error information for development debugging

#### Testing & Quality
- **Unit Tests**: Comprehensive Jest tests for ConfigService and StorageService
- **Configuration Validation Tests**: Business config schema and allowlist logic testing
- **Mock Infrastructure**: Proper mocking for Expo modules and React Native dependencies
- **Test Coverage**: Focus on core business logic and validation functions

#### Dependencies Added
- `react-native-webview`: WebView component for service store loading
- `expo-asset`: Asset management and preloading capabilities
- `expo-file-system`: File system access for configuration management
- `@react-native-async-storage/async-storage`: Persistent storage for user preferences
- `jest` and `@types/jest`: Testing framework and TypeScript support
- `jest-expo`: Expo-specific Jest preset and configuration

### Configuration Schema

#### Business Configuration Format
```json
{
  "id": "string (required)",
  "displayName": "string (required)",
  "primaryColor": "string (required, hex color)",
  "secondaryColor": "string (required, hex color)",
  "logoUrl": "string (required, image URL)",
  "storeUrl": "string (required, HTTPS URL)",
  "allowedHosts": "array (required, allowed domains)",
  "customUserAgent": "string (optional)",
  "status": "active|disabled (optional, default: active)"
}
```

#### Deep Link Format
- Custom scheme: `myapp://open?biz=<business-id>`
- Business ID must match configuration entry
- Overrides saved business selection

### Technical Implementation

#### Architecture
- **Singleton ConfigService**: Centralized configuration management
- **StorageService**: AsyncStorage abstraction with error handling
- **Component-based UI**: Modular React components for each screen/feature
- **TypeScript**: Full type safety for configuration and business logic

#### WebView Security
- `onShouldStartLoadWithRequest` allowlist enforcement
- External link detection and system browser redirection
- Custom user agent with app identification
- Cookie and storage enablement for service store functionality

#### State Management
- React hooks for local component state
- AsyncStorage for persistent user preferences
- In-memory configuration caching for performance
- Error boundary patterns for graceful error handling

### Platform Support
- **iOS**: Full feature support with platform-specific optimizations
- **Android**: Hardware back button integration and adaptive icons
- **Expo Managed Workflow**: No native code changes required

### Development Experience
- **Hot Reload**: Full development server with fast refresh
- **TypeScript**: Complete type definitions and IntelliSense support
- **ESLint**: Code quality and consistency enforcement
- **Jest Testing**: Automated testing with coverage reporting

### Files Added/Modified
- `app/_layout.tsx`: Complete rewrite for WebView shell architecture
- `assets/businesses.json`: Example business configuration
- `components/`: All new components (BusinessSelectionScreen, WebViewShell, etc.)
- `services/`: ConfigService and StorageService implementation
- `types/config.ts`: TypeScript definitions for business configuration
- `__tests__/`: Unit test suite for core functionality
- `jest.config.js`, `jest.setup.js`: Testing infrastructure
- `README.md`: Comprehensive documentation and usage guide

### Breaking Changes
- Complete transformation from standard Expo app to WebView shell
- Removed default tab navigation and example components
- New deep linking scheme requires app reinstall for testing
- Configuration-driven business selection replaces static content

### Migration Notes
- This is the initial release of the WebView shell functionality
- Existing installations should be uninstalled before testing new deep link scheme
- Remote configuration URL should be updated in production deployments
- Business logo URLs must be accessible and properly formatted

### Known Issues
- Jest tests have some mocking issues with Expo modules (functional but warnings present)
- Remote configuration URL is currently hardcoded in ConfigService
- Universal links require additional production configuration

### Next Steps
- Production deployment with proper app signing
- Analytics integration for usage tracking  
- Push notification support for business updates
- Enhanced caching for offline functionality