# WebViewShell Enhanced Loading Experience - QA Testing Checklist

## Overview
This document provides manual testing steps to validate the enhanced loading experience with debounced skeletons, action overlays, and progress indicators.

## Test Environment Setup
- Test on both iOS and Android devices/simulators
- Test with various network speeds (fast WiFi, slow mobile data)
- Test with different business URLs in the app configuration

## 1. Debounced Skeleton Loading Tests

### Test 1.1: Short Load Times (< 300ms)
**Objective**: Verify skeleton doesn't flash for quick page loads
- Navigate between pages quickly (home → schedules → profile)
- **Expected**: No skeleton loader should appear for fast transitions
- **Pass Criteria**: No visible skeleton flash during quick navigation

### Test 1.2: Initial App Load (> 300ms)
**Objective**: Verify full skeleton appears on first app launch
- Fresh app install or clear app cache
- Launch app and navigate to main store URL
- **Expected**: Full-screen skeleton with proper layout appears after 300ms delay
- **Pass Criteria**: Full skeleton shows, respects header/footer visibility, disappears when content loads

### Test 1.3: Subsequent Page Loads (> 300ms)
**Objective**: Verify overlay skeleton for navigation after initial load
- Navigate to a slow-loading page after initial app load
- Artificially slow network or navigate to heavy page
- **Expected**: Overlay skeleton (dim background + centered spinner) appears
- **Pass Criteria**: Header and footer remain visible, overlay skeleton shows over WebView content

## 2. Progress Bar Tests

### Test 2.1: Progress Bar Visibility
**Objective**: Verify progress bar appears and animates during page loads
- Navigate to any page
- **Expected**: Thin blue progress bar appears at top, animates from 0% to 100%
- **Pass Criteria**: Progress bar visible, smooth animation, disappears after completion

### Test 2.2: Progress Bar Positioning
**Objective**: Verify progress bar respects header visibility
- Test on pages with header (home, profile)
- Test on pages without header (checkout, inner routes)
- **Expected**: Progress bar positioned correctly (below header when present, at top when no header)
- **Pass Criteria**: No visual overlap with header, proper positioning

## 3. Action Overlay Tests

### Test 3.1: Booking Action Detection
**Objective**: Verify ActionOverlay appears when booking buttons are clicked
- Navigate to service booking page
- Click "Book Now" or similar booking buttons
- **Expected**: ActionOverlay appears with "Processing your booking..." message
- **Pass Criteria**: Small centered card appears, spinner animates, doesn't block reading

### Test 3.2: Checkout Action Detection  
**Objective**: Verify ActionOverlay appears for checkout actions
- Add items to cart and proceed to checkout
- Click "Checkout", "Proceed", or "Continue" buttons
- **Expected**: ActionOverlay appears with "Processing checkout..." message
- **Pass Criteria**: ActionOverlay shows appropriate message for action type

### Test 3.3: Action Completion
**Objective**: Verify ActionOverlay disappears when action completes
- Perform booking/checkout action
- Wait for page navigation or AJAX completion
- **Expected**: ActionOverlay disappears when network requests complete
- **Pass Criteria**: ActionOverlay hides automatically, no manual dismissal needed

### Test 3.4: Action Error Handling
**Objective**: Verify error state in ActionOverlay
- Perform action that fails (network error, validation failure)
- **Expected**: ActionOverlay shows error state with dismiss button
- **Pass Criteria**: Error icon and message shown, dismissible by user tap

## 4. Payment Domain Exclusion Tests

### Test 4.1: Stripe Payment Pages
**Objective**: Verify no overlays appear on Stripe payment domains
- Navigate to checkout and proceed to Stripe payment
- URLs containing: stripe.com, checkout.stripe.com, pay.stripe.com
- **Expected**: No skeleton loaders, no action overlays, no script injection
- **Pass Criteria**: Payment flow works normally without interference

### Test 4.2: hCaptcha Pages
**Objective**: Verify no overlays on hCaptcha domains  
- Encounter hCaptcha verification during checkout
- URLs containing: hcaptcha.com, newassets.hcaptcha.com
- **Expected**: No overlays or script interference with captcha
- **Pass Criteria**: Captcha works normally, no visual interference

### Test 4.3: Checkout Path Exclusion
**Objective**: Verify overlays are excluded from checkout paths
- Navigate to URLs containing: /checkout/, /payment/, /reviewbooking/, /welcome/success/
- **Expected**: Minimal overlays, no action detection injection
- **Pass Criteria**: Checkout flow uninterrupted by overlay features

## 5. Navigation and State Management Tests

### Test 5.1: Header/Footer Visibility
**Objective**: Verify overlays don't cover navigation elements
- Test on pages with different header/footer combinations
- Trigger various overlay types
- **Expected**: NavHeader and BottomMenu always remain visible and functional
- **Pass Criteria**: Navigation elements never obscured by overlays

### Test 5.2: Back Navigation
**Objective**: Verify overlays don't interfere with back button
- Trigger overlays then use device back button or in-app back
- **Expected**: Navigation works normally, overlays clear appropriately
- **Pass Criteria**: Back navigation functional, no stuck overlay states

### Test 5.3: Deep Linking
**Objective**: Verify overlay behavior with direct URL navigation
- Open app with deep link to specific page
- **Expected**: Appropriate overlay behavior based on page type and load time
- **Pass Criteria**: No unexpected overlay states, proper initial load handling

## 6. Performance and Memory Tests

### Test 6.1: Memory Leaks
**Objective**: Verify timers are cleaned up properly
- Navigate through multiple pages repeatedly
- Monitor app memory usage over time
- **Expected**: No memory growth from uncleaned timers
- **Pass Criteria**: Stable memory usage, no JavaScript timer leaks

### Test 6.2: Script Injection Performance
**Objective**: Verify enhanced injection doesn't impact performance
- Navigate to pages with complex DOM structures
- Monitor page load times and responsiveness
- **Expected**: No noticeable performance degradation
- **Pass Criteria**: Page loads remain responsive, no blocking script execution

## 7. Edge Cases and Error Scenarios

### Test 7.1: Network Timeout
**Objective**: Test overlay behavior during network timeouts
- Navigate to page and force network timeout
- **Expected**: Appropriate error handling, overlays clear after timeout
- **Pass Criteria**: No stuck loading states, error handling works

### Test 7.2: Rapid Navigation
**Objective**: Test overlay behavior with rapid page changes
- Quickly navigate between multiple pages
- **Expected**: Overlays clear properly, no overlapping states
- **Pass Criteria**: Clean state transitions, no visual glitches

### Test 7.3: Background/Foreground App Switching
**Objective**: Test overlay persistence across app lifecycle
- Trigger overlays then background/foreground app
- **Expected**: Appropriate overlay state restoration or clearing
- **Pass Criteria**: No stuck overlay states after app lifecycle events

## 8. Cross-Platform Consistency Tests

### Test 8.1: iOS vs Android Behavior
**Objective**: Verify consistent behavior across platforms
- Run same test scenarios on both iOS and Android
- **Expected**: Identical overlay behavior and timing
- **Pass Criteria**: No platform-specific overlay issues

### Test 8.2: Different Screen Sizes
**Objective**: Verify overlays scale properly across device sizes
- Test on phones, tablets, different screen densities
- **Expected**: Overlays properly sized and positioned on all devices
- **Pass Criteria**: Responsive design, no overlay clipping or overflow

## Regression Testing Checklist

### Existing Functionality Must Still Work:
- [ ] Logout detection and handling
- [ ] External link opening in system browser  
- [ ] Web header/footer hiding on non-payment pages
- [ ] Bottom menu navigation
- [ ] Modal detection and handling
- [ ] Hardware back button handling (Android)
- [ ] WebView allowlist security
- [ ] Cookie and storage management

## Test Completion Criteria
- [ ] All test cases pass on both iOS and Android
- [ ] No performance regressions identified
- [ ] No memory leaks detected
- [ ] All existing functionality works unchanged
- [ ] Payment flows work without interference
- [ ] User experience improvements are noticeable

## Common Issues and Debugging

### If Skeleton Doesn't Appear:
1. Check console logs for "Showing skeleton after delay"
2. Verify `isLoading` state changes correctly
3. Check if URL is in payment domain exclusion list

### If ActionOverlay Doesn't Appear:
1. Check console logs for "Action button clicked" messages
2. Verify button selectors are being detected correctly
3. Check if page is excluded from action detection

### If Progress Bar Doesn't Show:
1. Verify `onLoadProgress` events are firing
2. Check progress bar z-index and positioning
3. Ensure `isLoading` state is properly managed

### If Payment Pages Break:
1. Check `isPaymentDomain` function logic
2. Verify script injection is being skipped
3. Review console for any injection-related errors