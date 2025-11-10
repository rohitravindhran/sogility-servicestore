import * as Linking from 'expo-linking';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ConfigService } from '../services/ConfigService';
import { StorageService } from '../services/StorageService';
import { Business } from '../types/config';
import {
  addQueryParam,
  generateNavigationScript,
  getRouteData,
  WEBVIEW_INJECTION_SCRIPT
} from '../utils/routeUtils';
import ActionOverlay from './ActionOverlay';
import BottomMenu from './BottomMenu';
import NavHeader from './NavHeader';
import ProgressBar from './ProgressBar';
import SkeletonLoader from './SkeletonLoader';

interface WebViewShellProps {
  business: Business;
  onError: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onNavigationStateChange?: (navState: any) => void;
  onLogout?: () => void;
}

export default function WebViewShell({ 
  business, 
  onError,
  onLoadStart,
  onLoadEnd,
  onNavigationStateChange,
  onLogout
}: WebViewShellProps) {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(business.storeUrl);
  const [routeData, setRouteData] = useState(getRouteData(business.storeUrl));
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const configService = ConfigService.getInstance();
  
  // Refs for timer cleanup
  const skeletonTimeoutRef = useRef<number | null>(null);

  // Handle logout - clear auth data and redirect
  const handleLogout = async () => {
    try {
      console.log('Handling logout - clearing authentication data');
      
      // Clear all authentication data
      await StorageService.clearAuthData();
      
      // Clear WebView cookies and cache
      if (webViewRef.current) {
        // Clear WebView cookies by injecting JavaScript
        webViewRef.current.injectJavaScript(`
          // Clear all cookies
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          
          // Clear localStorage and sessionStorage
          if (window.localStorage) {
            window.localStorage.clear();
          }
          if (window.sessionStorage) {
            window.sessionStorage.clear();
          }
          
          console.log('Authentication data cleared from WebView');
          true;
        `);
      }
      
      // Call parent logout handler if provided
      if (onLogout) {
        console.log('Calling onLogout callback to navigate to native login screen');
        onLogout();
        return; // Important: return early to prevent further execution
      } else {
        console.log('No onLogout callback provided, cannot redirect to native login screen');
        // Don't set currentUrl to avoid loops, let parent component handle this
        return;
      }
      
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Debug route data
  useEffect(() => {
    console.log('Current URL:', currentUrl);
    console.log('Route Data:', JSON.stringify(routeData, null, 2));
    console.log('Should show header:', routeData.showHeader);
    console.log('Should show bottom menu:', routeData.showBottomMenu);
    
    // Global navigation function for debugging
    (global as any).navigateToHome = () => {
      console.log('Navigating to home page...');
      setCurrentUrl(business.storeUrl);
    };
  }, [currentUrl, routeData, business.storeUrl]);

  // Debounced skeleton loading logic
  useEffect(() => {
    // Clear existing timeout
    if (skeletonTimeoutRef.current) {
      clearTimeout(skeletonTimeoutRef.current);
      skeletonTimeoutRef.current = null;
    }

    if (isLoading) {
      // Don't show skeleton on payment domains
      if (isPaymentDomain(currentUrl)) {
        console.log('Skipping skeleton on payment domain:', currentUrl);
        setShowSkeleton(false);
        return;
      }

      // Set timeout to show skeleton after 300ms
      skeletonTimeoutRef.current = setTimeout(() => {
        console.log('Showing skeleton after delay');
        setShowSkeleton(true);
      }, 300);
    } else {
      // Hide skeleton immediately when loading stops
      setShowSkeleton(false);
      // After first successful load, no longer initial load
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current);
        skeletonTimeoutRef.current = null;
      }
    };
  }, [isLoading, currentUrl, isInitialLoad]);

  // Handle Android hardware back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior (exit app)
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  // Generate user agent string
  const getUserAgent = (): string => {
    const appIdentifier = `SogilityServiceStore/1.0`;
    const platformInfo = Platform.OS === 'ios' ? 'iOS' : 'Android';
    const baseUserAgent = `${appIdentifier} (${platformInfo})`;
    
    return business.customUserAgent 
      ? `${baseUserAgent} ${business.customUserAgent}`
      : baseUserAgent;
  };

  // Check if current URL is a payment domain or payment-related page that should not have injection
  const isPaymentDomain = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      
      // External payment domains (Stripe, hCaptcha, etc.)
      const paymentDomains = [
        'js.stripe.com',
        'checkout.stripe.com', 
        'pay.stripe.com',
        'connect.stripe.com',
        'm.stripe.com',
        'stripe.network',
        'm.stripe.network',
        'b.stripecdn.com',
        'q.stripe.com',
        'r.stripe.com',
        'hooks.stripe.com',
        'api.stripe.com',
        'hcaptcha.com',
        'newassets.hcaptcha.com',
        'accounts.hcaptcha.com',
        'pst-issuer.hcaptcha.com',
        'api.hcaptcha.com'
      ];
      
      // Check external payment domains
      if (paymentDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      )) {
        return true;
      }
      
      // Check payment-related paths on business domain
      const paymentPaths = [
        '/checkout/',
        '/payment/',
        '/welcome/reviewbooking/',
        '/welcome/success/',
        '/welcome/failure/',
        '/billing/',
        '/invoice/',
        '/receipt/'
      ];
      
      return paymentPaths.some(path => urlObj.pathname.includes(path));
    } catch {
      return false;
    }
  };

  // Combined injected JavaScript - skip injection on payment domains
  const injectedJavaScript = `
    // Check if this is a payment domain
    const isPaymentPage = ${isPaymentDomain(currentUrl)};
    
    console.log('Page URL:', window.location.href);
    console.log('Is payment domain:', isPaymentPage);
    
    if (isPaymentPage) {
      console.log('Skipping JavaScript injection on payment domain');
      // Only minimal console logging for payment pages
    } else {
      console.log('Running full JavaScript injection...');
      ${WEBVIEW_INJECTION_SCRIPT}
    }
    
    // Additional functionality for title and external links
    (function() {
      // Post page title to React Native
      const sendTitle = () => {
        const title = document.title;
        if (title && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAGE_TITLE',
            title: title
          }));
        }
      };

      // Send title on load and when it changes
      sendTitle();
      const observer = new MutationObserver(() => sendTitle());
      observer.observe(document.querySelector('title') || document.head, {
        childList: true,
        subtree: true
      });

      // Intercept external links (target="_blank")
      document.addEventListener('click', function(event) {
        const target = event.target.closest('a');
        if (target && target.target === '_blank' && target.href) {
          event.preventDefault();
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'EXTERNAL_LINK',
              url: target.href
            }));
          }
        }
        
        // Detect logout links
        if (target && target.href && target.href.includes('logout')) {
          console.log('Logout link clicked:', target.href);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGOUT'
            }));
          }
        }
      });

      // Monitor for logout URL changes
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        originalPushState.apply(this, args);
        if (window.location.href.includes('logout')) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGOUT'
            }));
          }
        }
      };
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        if (window.location.href.includes('logout')) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGOUT'
            }));
          }
        }
      };

      // Check for page loading issues on checkout pages
      setTimeout(() => {
        const isCheckout = window.location.href.includes('checkout');
        if (isCheckout) {
          const hasContent = document.body.children.length > 0;
          const bodyText = document.body.textContent || '';
          console.log('Checkout page check - Has content:', hasContent, 'Body length:', bodyText.length);
          
          if (!hasContent || bodyText.length < 100) {
            console.warn('Checkout page appears to have loading issues');
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAGE_LOADING_ISSUE',
                url: window.location.href,
                hasContent: hasContent,
                bodyLength: bodyText.length
              }));
            }
          }
        }
      }, 3000);

      // Log console messages for debugging
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.log = function(...args) {
        originalLog.apply(console, args);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CONSOLE_LOG',
            level: 'log',
            message: args.join(' ')
          }));
        }
      };
      
      console.error = function(...args) {
        originalError.apply(console, args);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CONSOLE_LOG',
            level: 'error',
            message: args.join(' ')
          }));
        }
      };
      
      console.warn = function(...args) {
        originalWarn.apply(console, args);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CONSOLE_LOG',
            level: 'warn',
            message: args.join(' ')
          }));
        }
      };
    })();
    true; // Required for injected JavaScript
  `;

  // Handle messages from WebView
  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'PAGE_TITLE':
          console.log('Page title changed:', data.title);
          break;
          
        case 'EXTERNAL_LINK':
          console.log('Opening external link:', data.url);
          Linking.openURL(data.url).catch((err: any) => {
            console.error('Failed to open external link:', err);
            Alert.alert('Error', 'Failed to open link in external browser');
          });
          break;
          
        case 'CONSOLE_LOG':
          console.log(`WebView Console [${data.level}]:`, data.message);
          break;

        case 'MODAL_OPENED':
          console.log('Modal opened - hiding bottom menu');
          setRouteData(prev => ({ ...prev, showBottomMenu: false }));
          break;

        case 'MODAL_CLOSED':
          console.log('Modal closed - restoring bottom menu');
          const newRouteData = getRouteData(currentUrl);
          setRouteData(newRouteData);
          break;

        case 'LOGIN_MODAL_OPENED':
          console.log('Login modal opened');
          // Handle logout or login modal
          break;

        case 'NAVIGATE_TO':
          console.log('Navigation request:', data.route);
          handleBottomMenuNavigation(data.route);
          break;

        case 'PAGE_LOADING_ISSUE':
          console.error('Page loading issue detected:', data);
          // You might want to show an error message or reload the page
          if (data.bodyLength < 50) {
            console.log('Attempting to reload due to loading issue...');
            setTimeout(() => {
              if (webViewRef.current) {
                webViewRef.current.reload();
              }
            }, 1000);
          }
          break;

        case 'LOGOUT':
          console.log('Logout message received from WebView');
          handleLogout();
          break;

        case 'ACTION_START':
          console.log('Action started:', data.action);
          setActionLoading(prev => ({ ...prev, [data.action]: true }));
          setActionError(null);
          break;

        case 'ACTION_END':
          console.log('Action ended:', data.action, 'Reason:', data.reason);
          setActionLoading(prev => {
            const newState = { ...prev };
            if (data.action) {
              delete newState[data.action];
            } else {
              // Clear all if no specific action
              return {};
            }
            return newState;
          });
          break;

        case 'FETCH_DONE':
        case 'XHR_DONE':
          console.log('Network request completed:', data.type);
          // Clear all action loading states when network activity completes
          setActionLoading({});
          break;
          
        default:
          console.log('Unknown message from WebView:', data);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  // Handle bottom menu navigation
  const handleBottomMenuNavigation = (route: string) => {
    const baseUrl = business.storeUrl.replace(/\/home$/, '');
    let targetUrl;
    
    // Handle specific routes with custom URLs
    switch (route) {
      case 'profile':
        // Use specific profile URL with my-schedule and status parameter
        targetUrl = `${baseUrl}/profile/my-schedule?status=upcoming`;
        break;
      case 'home':
        targetUrl = `${baseUrl}/home`;
        break;
      case 'schedules':
        targetUrl = `${baseUrl}/schedules`;
        break;
      case 'subscriptions':
        targetUrl = `${baseUrl}/subscriptions`;
        break;
      default:
        targetUrl = `${baseUrl}/${route}`;
        break;
    }
    
    // Add query parameter to indicate WebView navigation
    targetUrl = addQueryParam(targetUrl, 'isWebView=true');
    
    console.log('Navigating to:', targetUrl);
    setCurrentUrl(targetUrl);
    
    // Inject navigation script to handle client-side routing
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(generateNavigationScript(route));
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    if (currentUrl.includes('welcome/success')) {
      // Navigate back to home on success page
      setCurrentUrl(business.storeUrl);
    } else if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  // Navigation state change handler
  const handleNavigationStateChange = (navState: any) => {
    const { url, loading } = navState;
    
    setCanGoBack(navState.canGoBack);
    
    if (url && !loading) {
      console.log('URL changed to:', url);
      
      // Check for specific login URL and redirect to native login screen
      if (url === 'https://demosojility.getomnify.com/auth/login' || url.includes('demosojility.getomnify.com/auth/login')) {
        console.log('Login URL detected in navigation state change, redirecting to native login screen:', url);
        handleLogout();
        return;
      }
      
      // Check for logout in URL changes
      if (url.includes('welcome/logout')) {
        console.log('Logout detected in URL change:', url);
        handleLogout();
        return;
      }
      
      setCurrentUrl(url);
      
      // Update route data based on new URL
      const newRouteData = getRouteData(url);
      setRouteData(newRouteData);
      
      // Inject JavaScript after navigation - but skip payment domains
      setTimeout(() => {
        if (webViewRef.current) {
          if (isPaymentDomain(url)) {
            console.log('Skipping JavaScript injection on payment domain:', url);
          } else {
            console.log('Injecting JavaScript for:', url);
            webViewRef.current.injectJavaScript(WEBVIEW_INJECTION_SCRIPT);
          }
        }
      }, 500);
    }
    
    onNavigationStateChange?.(navState);
  };

  // Allowlist check for navigation
  const onShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    
    console.log('Navigation request to:', url);
    
    // Check for specific login URL and redirect to native login screen
    if (url === 'https://demosojility.getomnify.com/auth/login' || url.includes('demosojility.getomnify.com/auth/login')) {
      console.log('Login URL detected, redirecting to native login screen:', url);
      handleLogout();
      return false;
    }
    
    // Handle logout redirects
    if (url.includes('welcome/logout') || url.includes('auth/login?redirect')) {
      console.log('Logout detected, handling authentication flow');
      handleLogout();
      return false;
    }
    
    // Always allow the initial store URL
    if (url === business.storeUrl) {
      return true;
    }

    // Handle external links (social media, app stores, etc.)
    if (
      url.startsWith('tel:') ||
      url.startsWith('mailto:') ||
      url.startsWith('https://www.facebook.com') ||
      url.startsWith('https://api.whatsapp.com') ||
      url.startsWith('https://www.linkedin.com') ||
      url.startsWith('https://twitter.com') ||
      url.startsWith('instagram:') ||
      url.startsWith('https://play.google') ||
      url.startsWith('https://apps.apple')
    ) {
      console.log('Opening external URL in system browser:', url);
      Linking.openURL(url).catch((err: any) => {
        console.error('Failed to open external URL:', err);
        Alert.alert('Error', 'Failed to open link');
      });
      return false;
    }

    // Allow common payment and service domains that should stay in WebView
    const paymentDomains = [
      'js.stripe.com',
      'checkout.stripe.com', 
      'pay.stripe.com',
      'connect.stripe.com',
      'm.stripe.com',
      'stripe.network',
      'm.stripe.network',
      'b.stripecdn.com',
      'q.stripe.com',
      'r.stripe.com',
      'hooks.stripe.com',
      'api.stripe.com',
      // hCaptcha domains (used by Stripe for fraud prevention)
      'hcaptcha.com',
      'newassets.hcaptcha.com',
      'accounts.hcaptcha.com',
      'pst-issuer.hcaptcha.com',
      'api.hcaptcha.com'
    ];

    try {
      const urlObj = new URL(url);
      
      // Allow payment domains to stay in WebView for seamless checkout
      if (paymentDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`))) {
        console.log('Allowing payment domain in WebView:', url);
        return true;
      }
    } catch (error) {
      console.error('Error parsing URL:', url, error);
    }

    // Check if the URL is in the allowed hosts
    const isAllowed = configService.isHostAllowed(business, url);
    
    if (!isAllowed) {
      console.log('Blocked navigation to unauthorized host:', url);
      // Open in external browser instead
      Linking.openURL(url).catch((err: any) => {
        console.error('Failed to open blocked URL in external browser:', err);
      });
      return false;
    }

    // For main routes, ensure we add the WebView query parameter
    const newRouteData = getRouteData(url);
    if (newRouteData.isMainRoute && !url.includes('isWebView=true')) {
      const updatedUrl = addQueryParam(url, 'isWebView=true');
      console.log('Adding WebView parameter to main route:', updatedUrl);
      
      // Navigate to updated URL
      setCurrentUrl(updatedUrl);
      return false; // Prevent original navigation
    }

    return true;
  };

  // Helper to check if any actions are loading
  const hasActiveActions = Object.keys(actionLoading).length > 0;
  const currentAction = Object.keys(actionLoading)[0] || 'booking';

  return (
    <View style={styles.container}>
      {/* Progress Bar - shows during page loads */}
      <ProgressBar
        progress={loadProgress}
        isVisible={isLoading}
        showHeader={routeData.showHeader}
      />

      {/* NavHeader - show based on route data */}
      {routeData.showHeader && (
        <NavHeader
          isVisible={true}
          showBackButton={routeData.showBackButton}
          business={business}
          onBackPress={handleBackPress}
          onMenuPress={() => {
            // Handle menu press - you might want to open a side drawer or menu
            console.log('Menu pressed');
          }}
        />
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={{ 
          flex: 1,
          marginTop: routeData.showHeader ? 0 : 0,
          marginBottom: routeData.showBottomMenu ? 0 : 0
        }}
        userAgent={getUserAgent()}
        injectedJavaScript={injectedJavaScript}
        onMessage={onMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onLoadStart={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView load started:', nativeEvent.url);
          setIsLoading(true);
          setLoadProgress(0);
          onLoadStart?.();
        }}
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView load ended:', nativeEvent.url, 'Success:', !nativeEvent.title?.includes('Error'));
          setIsLoading(false);
          setLoadProgress(1);
          onLoadEnd?.();
          
          // Inject JavaScript to hide web header/footer after loading - but skip payment domains
          setTimeout(() => {
            if (webViewRef.current) {
              if (isPaymentDomain(nativeEvent.url)) {
                console.log('Skipping onLoadEnd JavaScript injection on payment domain:', nativeEvent.url);
              } else {
                console.log('Injecting onLoadEnd JavaScript for:', nativeEvent.url);
                webViewRef.current.injectJavaScript(WEBVIEW_INJECTION_SCRIPT);
              }
            }
          }, 1000);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', {
            url: nativeEvent.url,
            code: nativeEvent.code,
            description: nativeEvent.description,
            canGoBack: nativeEvent.canGoBack,
            canGoForward: nativeEvent.canGoForward
          });
          setIsLoading(false);
          setActionError('Failed to load page');
          onError?.(nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error:', {
            url: nativeEvent.url,
            statusCode: nativeEvent.statusCode,
            description: nativeEvent.description
          });
          onError?.(nativeEvent);
        }}
        onLoadProgress={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          const progressPercent = Math.round(nativeEvent.progress * 100);
          setLoadProgress(nativeEvent.progress);
          console.log('WebView load progress:', `${progressPercent}%`, nativeEvent.url);
        }}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        originWhitelist={['*']} // We handle allowlist in onShouldStartLoadWithRequest
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
      />

      {/* BottomMenu - show based on route data */}
      {routeData.showBottomMenu && (
        <BottomMenu
          isVisible={true}
          currentRoute={routeData.currentRoute}
          onTabPress={handleBottomMenuNavigation}
        />
      )}

      {/* Skeleton Loader - Full mode for initial loads only */}
      {showSkeleton && isInitialLoad && !isPaymentDomain(currentUrl) && (
        <SkeletonLoader
          isLoading={true}
          mode="full"
          showBottomMenu={routeData.showBottomMenu}
          showHeader={routeData.showHeader}
        />
      )}

      {/* Overlay Skeleton - For subsequent page loads */}
      {showSkeleton && !isInitialLoad && !isPaymentDomain(currentUrl) && (
        <SkeletonLoader
          isLoading={true}
          mode="overlay"
        />
      )}

      {/* Action Overlay - For in-page actions like booking/checkout */}
      {!isPaymentDomain(currentUrl) && (
        <ActionOverlay
          isVisible={hasActiveActions}
          actionType={currentAction}
          error={actionError}
          onDismiss={() => {
            setActionError(null);
            setActionLoading({});
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});