# Demo Instructions - Sogility Service Store

This document provides step-by-step instructions to demonstrate the key features of the WhiteLabel WebView shell app.

## Prerequisites

Ensure the app is running in development mode:
```bash
npm start
```

## Demo Scenarios

### 1. First Launch - Business Selection 

**What to show**: Onboarding experience for new users

**Steps**:
1. Open the app (fresh install or cleared data)
2. **Expected**: Splash screen appears briefly
3. **Expected**: Business selection screen appears with:
   - App title "Select Your Service Store"
   - Two business cards (Acme Services & Hana Care)
   - Each card shows logo, name, and "Open Store" button
4. Tap "Open Store" on Acme Services
5. **Expected**: App navigates to WebView with Acme's blue theme

**Demo Points**:
- Smooth splash screen to selection transition
- Professional onboarding UI
- Business-specific theming preview

### 2. Deep Linking

**What to show**: Direct business access via URLs

**Steps**:
1. With app running, open terminal/command prompt
2. Execute deep link command:
   
   **iOS Simulator**:
   ```bash
   xcrun simctl openurl booted "myapp://open?biz=hana"
   ```
   
   **Android Emulator**:
   ```bash
   adb shell am start -W -a android.intent.action.VIEW -d "myapp://open?biz=hana" com.sogility.servicestore
   ```

3. **Expected**: App opens directly to Hana Care with orange theme
4. Try invalid business ID:
   ```bash
   xcrun simctl openurl booted "myapp://open?biz=invalid"
   ```
5. **Expected**: App shows business selection screen

**Demo Points**:
- Instant business selection
- URL scheme integration
- Error handling for invalid IDs

### 3. WebView Navigation & Security

**What to show**: Secure WebView with host allowlisting

**Steps**:
1. Open any business (e.g., Acme)
2. **Note**: WebView loads the business store URL
3. **Note**: Header shows business logo and name in brand color
4. In a real implementation, navigate to:
   - Allowed host link → loads in WebView
   - External host link → opens system browser

**Demo Points**:
- Themed header with business branding
- Secure navigation control
- Professional WebView integration

### 4. Offline Handling

**What to show**: Graceful offline experience

**Steps**:
1. With app running in WebView mode
2. Turn off device WiFi/data connection
3. Pull down to refresh or navigate
4. **Expected**: Offline error screen appears with:
   - Friendly "You appear to be offline" message
   - "Retry" button in business theme color
   - "Refresh Config" option

5. Turn WiFi back on
6. Tap "Retry"
7. **Expected**: WebView reloads successfully

**Demo Points**:
- User-friendly error messages
- Theme-consistent error UI
- Easy recovery workflow

### 5. Hardware Back Button (Android Only)

**What to show**: Native navigation behavior

**Steps**:
1. Open business WebView
2. Navigate within the website (if possible)
3. Press hardware back button
4. **Expected**: WebView navigates back in history
5. When at WebView root, press back again
6. **Expected**: App exits normally

**Demo Points**:
- Native Android UX integration
- WebView history navigation
- Smooth app exit

### 6. Debug Menu (Development Only)

**What to show**: Developer tools and diagnostics

**Steps**:
1. With business WebView open
2. **Long-press** the business logo in header
3. **Expected**: Debug menu modal opens with:
   - Current business configuration details
   - "Refresh Config" button
   - "Switch Business" button
   - Console logs section
   - App info section

4. Tap "Switch Business"
5. **Expected**: Returns to business selection screen

**Demo Points**:
- Development-only feature
- Real-time configuration viewing
- Easy business switching
- Debug information access

### 7. Persistent Business Selection

**What to show**: User preference persistence

**Steps**:
1. Select any business (e.g., Hana Care)
2. **Force close** the app (swipe up and close on iOS, use task manager on Android)
3. **Reopen** the app
4. **Expected**: App opens directly to previously selected business
5. Splash screen still appears but business loads automatically

**Demo Points**:
- Seamless user experience
- Preference persistence
- No re-onboarding required

### 8. Configuration Validation

**What to show**: Robust error handling

**Steps**:
1. Run unit tests to show validation:
   ```bash
   npm test
   ```
2. **Expected**: Tests pass showing:
   - Configuration schema validation
   - Host allowlist logic testing
   - Storage service functionality
   - Error handling coverage

**Demo Points**:
- Comprehensive testing
- Production-ready validation
- Error prevention

## Test Data

The demo uses two example businesses:

### Acme Services
- **Theme**: Blue (#1E90FF primary, #0D47A1 secondary)
- **ID**: `acme`
- **Deep Link**: `myapp://open?biz=acme`

### Hana Care  
- **Theme**: Orange (#F57C00 primary, #E65100 secondary)
- **ID**: `hana`
- **Deep Link**: `myapp://open?biz=hana`

## Demo Script

**Introduction** (1 minute):
"This is a production-ready whitelabel WebView shell that allows multiple businesses to use the same app with their own branding and service stores."

**Business Selection** (1 minute):
"First-time users see a polished selection screen. Notice the business-specific logos, colors, and professional design."

**Deep Linking** (1 minute):
"Marketing campaigns can link directly to specific businesses using deep links. Watch how the app opens directly to the right business."

**WebView Integration** (2 minutes):
"The WebView loads the business service store with security controls. Notice the themed header and how external links would open in the system browser."

**Offline Handling** (1 minute):
"The app gracefully handles network issues with friendly error screens and easy retry options."

**Developer Tools** (1 minute):
"Development includes a debug menu for configuration management and troubleshooting."

**Wrap-up** (1 minute):
"This provides a complete whitelabel solution with security, theming, offline handling, and native UX integration."

## Troubleshooting Demo Issues

**App won't start**: Run `npm install` and ensure all dependencies are installed
**Deep links don't work**: Verify correct URL scheme and business IDs
**WebView shows error**: Check network connection and business configuration
**Tests fail**: Some Jest mocking warnings are expected but tests should pass
**Images not loading**: Ensure development device has internet access

## Production Considerations

For production deployment:
- Update remote configuration URL in `ConfigService.ts`
- Configure proper app signing and store listings
- Set up universal links for iOS and Android
- Add analytics and crash reporting
- Update business configurations with real service store URLs