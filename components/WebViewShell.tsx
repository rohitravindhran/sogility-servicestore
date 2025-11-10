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
  
  // Targeted timeout and retry logic for idle-state fix
  const actionTimeoutRef = useRef<number | null>(null);
  const actionTargetRef = useRef<{ [k: string]: string }>({});
  const actionRetryRef = useRef<{ [k: string]: number }>({});
  const navPollRef = useRef<number | null>(null);
  const ACTION_TIMEOUT_MS = 12000; // 12s
  const ACTION_RETRY_LIMIT = 1;
  
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

  // Optimized skeleton loading logic - show quickly to reduce idle time
  useEffect(() => {
    // Clear existing timeout
    if (skeletonTimeoutRef.current) {
      clearTimeout(skeletonTimeoutRef.current);
      skeletonTimeoutRef.current = null;
    }

    if (isLoading) {
      // Don't show skeleton on payment domains or addons pages to prevent UI interference
      if (isPaymentDomain(currentUrl) || isAddonsPage(currentUrl)) {
        console.log('Skipping skeleton on special page:', currentUrl);
        setShowSkeleton(false);
        return;
      }

      // Show skeleton immediately for initial load, very short delay for subsequent loads
      const delay = isInitialLoad ? 0 : 100; // 0ms for initial, 100ms for subsequent
      skeletonTimeoutRef.current = setTimeout(() => {
        console.log('Showing skeleton after delay:', delay + 'ms');
        setShowSkeleton(true);
      }, delay);
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
      
      // External payment domains (Stripe, hCaptcha, etc.) - these should skip injection
      const externalPaymentDomains = [
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
      
      // Check external payment domains - these should skip injection
      if (externalPaymentDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      )) {
        return true;
      }
      
      // For business domains, only skip injection on final payment processing pages
      // NOT on checkout pages where user is still making selections
      const finalPaymentPaths = [
        '/welcome/reviewbooking/',
        '/welcome/success/',
        '/welcome/failure/',
        '/billing/invoice/',
        '/receipt/',
        '/payment/complete/',
        '/payment/success/',
        '/payment/failure/'
      ];
      
      return finalPaymentPaths.some(path => urlObj.pathname.includes(path));
    } catch {
      return false;
    }
  };

  // Check if current URL is an addons/selection page that should have limited monitoring
  const isAddonsPage = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const addonsPatterns = [
        '/welcome/addons',
        '/addons',
        '/membership/select',
        '/packages/select',
        '/extras',
        '/upgrades'
      ];
      
      return addonsPatterns.some(pattern => urlObj.pathname.includes(pattern));
    } catch {
      return false;
    }
  };

  // Combined injected JavaScript - skip injection on payment domains
  const injectedJavaScript = `
    // Check if this is a payment domain or addons page
    const isPaymentPage = ${isPaymentDomain(currentUrl)};
    const isAddonsPage = ${isAddonsPage(currentUrl)};
    
    console.log('Page URL:', window.location.href);
    console.log('Is payment domain:', isPaymentPage);
    console.log('Is addons page:', isAddonsPage);
    
    if (isPaymentPage) {
      console.log('Skipping JavaScript injection on payment domain');
      // Only minimal console logging for payment pages
    } else {
      console.log('Running JavaScript injection...');
      ${WEBVIEW_INJECTION_SCRIPT}
      
      // Targeted idle-state fix: Book/Proceed action monitoring (reduced for addons pages)
      (function() {
        // For addons pages, use more selective monitoring
        const selectors = isAddonsPage ? [
          'button[data-action="checkout"]',
          'a[href*="checkout"]',
          'form[action*="checkout"] button[type="submit"]',
          'button[type="submit"][value*="book"]'
        ] : [
          'button[data-action="book"]',
          'button[data-action="checkout"]',
          'button[id*="book"]',
          'button[id*="checkout"]',
          'a[href*="checkout"]',
          'form[action*="checkout"] button[type="submit"]'
        ];

        function post(type, payload = {}) {
          try {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...payload }));
            }
          } catch(e) {}
        }

        function getTarget(el) {
          if (el.tagName === 'A' && el.href) return el.href;
          if (el.form && el.form.action) return el.form.action;
          return el.getAttribute('data-target') || null;
        }

        function hookButtons() {
          selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
              if (el.__nativeBookingHook) return;
              el.__nativeBookingHook = true;
              el.addEventListener('click', function() {
                const target = getTarget(this);
                
                // For addons pages, be more selective about which buttons trigger monitoring
                const text = this.textContent?.toLowerCase() || '';
                let shouldMonitor = false;
                
                if (isAddonsPage) {
                  // On addons pages, only monitor final booking/checkout actions, not addon selection
                  shouldMonitor = /^(book|checkout|proceed to booking|continue to checkout|confirm booking)/.test(text) && text.length < 100;
                } else {
                  // Regular pages use broader monitoring
                  shouldMonitor = /book|checkout|proceed|continue|confirm|purchase|buy/.test(text) && text.length < 50;
                }
                
                if ((shouldMonitor || target) && !text.includes('addon') && !text.includes('add ')) {
                  console.log('Starting action monitor for:', text, 'target:', target);
                  post('ACTION_START', { 
                    action: 'booking', 
                    url: window.location.href, 
                    target: target 
                  });
                  
                  // Start action monitor
                  startActionMonitor();
                }
              }, { capture: true });
            });
          });
          
          // For non-addons pages, also hook buttons by text content
          if (!isAddonsPage) {
            document.querySelectorAll('button, a[role="button"], .btn').forEach(el => {
              if (el.__nativeBookingHook) return;
              const text = el.textContent?.toLowerCase().trim() || '';
              if (/^(book|checkout|proceed|continue|confirm|purchase|buy)/.test(text) && text.length < 50) {
                el.__nativeBookingHook = true;
                el.addEventListener('click', function() {
                  const target = getTarget(this);
                  console.log('Starting action monitor for text-based button:', text);
                  post('ACTION_START', { 
                    action: 'booking', 
                    url: window.location.href, 
                    target: target 
                  });
                  
                  startActionMonitor();
                }, { capture: true });
              }
            });
          }
        }

        function startActionMonitor() {
          const startUrl = window.location.href;
          let monitorActive = true;
          let checkCount = 0;
          // Shorter timeout for addons pages
          const maxChecks = isAddonsPage ? 20 : 40; // 10s vs 20s at 500ms intervals
          
          const checkInterval = setInterval(() => {
            if (!monitorActive || checkCount >= maxChecks) {
              clearInterval(checkInterval);
              return;
            }
            
            checkCount++;
            
            // Check URL changes
            if (window.location.href !== startUrl) {
              post('ACTION_END', { 
                reason: 'location_change', 
                url: window.location.href 
              });
              monitorActive = false;
              clearInterval(checkInterval);
              return;
            }
            
            // Check for payment/checkout iframes
            if (document.querySelector('iframe[src*="stripe"], iframe[src*="payment"], iframe[src*="checkout"]')) {
              post('ACTION_END', { 
                reason: 'payment_iframe', 
                url: window.location.href 
              });
              monitorActive = false;
              clearInterval(checkInterval);
              return;
            }
            
            // More lenient checking for addons pages
            const bodyText = document.body.textContent || '';
            if (isAddonsPage) {
              // For addons pages, just check if page has loaded content
              if (bodyText.length > 300) {
                post('ACTION_END', { 
                  reason: 'addons_page_loaded', 
                  url: window.location.href 
                });
                monitorActive = false;
                clearInterval(checkInterval);
                return;
              }
            } else {
              // Regular checkout/payment content detection
              const hasCheckoutContent = /checkout.*summary|payment.*details|order.*summary|booking.*confirmation|thank.*you.*booking/i.test(bodyText);
              if (hasCheckoutContent && bodyText.length > 500) {
                post('ACTION_END', { 
                  reason: 'checkout_text_appeared', 
                  url: window.location.href 
                });
                monitorActive = false;
                clearInterval(checkInterval);
                return;
              }
            }
            
            // Check if loading spinners disappeared and page has content
            const spinners = document.querySelectorAll('.loading, .spinner, [class*="load"], [class*="spin"]');
            const hasVisibleSpinners = Array.from(spinners).some(s => {
              const style = window.getComputedStyle(s);
              return style.display !== 'none' && style.visibility !== 'hidden';
            });
            
            const minContentLength = isAddonsPage ? 300 : 500;
            if (!hasVisibleSpinners && bodyText.length > minContentLength) {
              post('ACTION_END', { 
                reason: 'no_loading_elements_and_has_content', 
                url: window.location.href 
              });
              monitorActive = false;
              clearInterval(checkInterval);
              return;
            }
          }, 500);
          
          // Auto-stop after timeout (shorter for addons pages)
          const timeout = isAddonsPage ? 10000 : 20000;
          setTimeout(() => {
            monitorActive = false;
            clearInterval(checkInterval);
          }, timeout);
        }

        // Initialize with less frequent re-hooking for addons pages
        hookButtons();
        
        // Re-hook on DOM changes (less aggressive for addons pages)
        const hookInterval = setInterval(hookButtons, isAddonsPage ? 1500 : 800);
        setTimeout(() => clearInterval(hookInterval), isAddonsPage ? 8000 : 15000);
      })();
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
          // Only hide menu if we're not in a booking flow
          if (!hasActiveActions) {
            setRouteData(prev => ({ ...prev, showBottomMenu: false }));
          }
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
          // For addons pages, be more lenient - they might have dynamic content loading
          if (isAddonsPage(data.url)) {
            console.log('Addons page loading issue - monitoring for content...');
            // Don't auto-reload addons pages, just log for debugging
          } else if (data.bodyLength < 50) {
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

        case 'ACTION_START': {
          const action = data.action || 'default';
          const target = data.target || null;
          console.log('ACTION_START', action, 'target:', target);

          // Store target for potential retry
          if (target) {
            actionTargetRef.current[action] = target;
          }

          // Small delay before showing overlay to allow normal navigation to start
          setTimeout(() => {
            setActionLoading(prev => ({ ...prev, [action]: true }));
            setActionError(null);
          }, 300);

          // Clear any existing timeout for this action
          if (actionTimeoutRef.current) {
            clearTimeout(actionTimeoutRef.current as any);
            actionTimeoutRef.current = null;
          }

          // Start a timeout to detect long running action
          actionTimeoutRef.current = setTimeout(() => {
            console.warn(`Action '${action}' timed out after ${ACTION_TIMEOUT_MS}ms`);
            
            // Inject script to check page content length for debugging
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(`
                (function(){
                  try {
                    const bodyText = document.body ? (document.body.textContent || '').length : 0;
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAGE_CONTENT_LENGTH', len: bodyText, url: window.location.href }));
                    }
                  } catch(e){}
                })();
                true;
              `);
            }

            const target = actionTargetRef.current[action];
            const retries = actionRetryRef.current[action] || 0;
            
            // Check if target is safe for automatic retry (not payment endpoints)
            const isSafeForRetry = target && !(/payment|charge|complete|checkout/.test(target.toLowerCase()));
            
            if (retries < ACTION_RETRY_LIMIT && isSafeForRetry && target) {
              console.log('Attempting targeted retry for action', action, 'target:', target);
              actionRetryRef.current[action] = retries + 1;
              
              // Resolve relative URLs and inject targeted navigation
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`
                  (function(){
                    try {
                      const target = '${target}';
                      const resolvedUrl = new URL(target, window.location.href).href;
                      console.log('Targeted retry navigation to:', resolvedUrl);
                      window.location.href = resolvedUrl;
                    } catch(e) {
                      console.error('Retry navigation failed:', e);
                    }
                  })();
                  true;
                `);
              }

              // Start NAV_POLL to monitor navigation
              let pollCount = 0;
              const maxPolls = 20; // ~10s at 500ms intervals
              
              navPollRef.current = setInterval(() => {
                if (pollCount >= maxPolls || !webViewRef.current) {
                  if (navPollRef.current) {
                    clearInterval(navPollRef.current);
                    navPollRef.current = null;
                  }
                  // Show fallback UI if polling didn't detect navigation
                  setActionLoading(prev => ({ ...prev, [`${action}_timedout`]: true }));
                  return;
                }
                
                pollCount++;
                webViewRef.current.injectJavaScript(`
                  (function(){
                    try {
                      if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ 
                          type: 'NAV_POLL', 
                          url: window.location.href 
                        }));
                      }
                    } catch(e){}
                  })();
                  true;
                `);
              }, 500) as any;
            } else {
              // Show fallback UI immediately (unsafe target or no retries left)
              setActionLoading(prev => ({ ...prev, [`${action}_timedout`]: true }));
            }
          }, ACTION_TIMEOUT_MS) as any;
          break;
        }

        case 'ACTION_END':
        case 'XHR_DONE':
        case 'FETCH_DONE': {
          console.log('Action/network finished', data.type, data.action);
          
          // Clear action loading and any timeouts
          setActionLoading({});
          if (actionTimeoutRef.current) {
            clearTimeout(actionTimeoutRef.current as any);
            actionTimeoutRef.current = null;
          }
          if (navPollRef.current) {
            clearInterval(navPollRef.current as any);
            navPollRef.current = null;
          }
          break;
        }

        case 'NAV_POLL': {
          const pollUrl = data.url;
          console.log('NAV_POLL received:', pollUrl);
          
          // Only clear if there's a significant URL change (not just hash/query changes)
          const currentUrlBase = currentUrl.split('#')[0].split('?')[0];
          const pollUrlBase = pollUrl.split('#')[0].split('?')[0];
          
          if (pollUrlBase !== currentUrlBase || /\/checkout\/|\/payment\/|\/success\/|\/complete\//.test(pollUrl.toLowerCase())) {
            console.log('Significant navigation detected via NAV_POLL, clearing overlays');
            setActionLoading({});
            if (actionTimeoutRef.current) {
              clearTimeout(actionTimeoutRef.current as any);
              actionTimeoutRef.current = null;
            }
            if (navPollRef.current) {
              clearInterval(navPollRef.current as any);
              navPollRef.current = null;
            }
          }
          break;
        }

        case 'PAGE_CONTENT_LENGTH':
          console.log('Page content length check:', data.len, 'URL:', data.url);
          // If page has content, assume action completed
          if (data.len > 100) {
            console.log('Page has content, clearing action overlay');
            setActionLoading({});
            if (actionTimeoutRef.current) {
              clearTimeout(actionTimeoutRef.current as any);
              actionTimeoutRef.current = null;
            }
            if (navPollRef.current) {
              clearInterval(navPollRef.current as any);
              navPollRef.current = null;
            }
          }
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
    
    // Start loading state immediately to show skeleton
    setIsLoading(true);
    setLoadProgress(0);
    
    setCurrentUrl(targetUrl);
    
    // Inject navigation script to handle client-side routing
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(generateNavigationScript(route));
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    // Start loading state immediately to show skeleton
    setIsLoading(true);
    setLoadProgress(0);
    
    if (currentUrl.includes('welcome/success')) {
      // Navigate back to home on success page
      setCurrentUrl(business.storeUrl);
    } else if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  // Navigation state change handler - optimized for performance
  const handleNavigationStateChange = (navState: any) => {
    const { url, loading } = navState;
    
    setCanGoBack(navState.canGoBack);
    
    // Show loading state immediately when navigation starts
    if (loading && url !== currentUrl) {
      setIsLoading(true);
      setLoadProgress(0);
    }
    
    if (url && !loading) {
      // Clear any action timeout on navigation (fast cleanup)
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current as any);
        actionTimeoutRef.current = null;
        setActionLoading({});
        actionRetryRef.current = {};
      }
      if (navPollRef.current) {
        clearInterval(navPollRef.current as any);
        navPollRef.current = null;
      }
      
      // Quick logout detection (optimized checks)
      if (url.includes('auth/login') || url.includes('welcome/logout')) {
        handleLogout();
        return;
      }
      
      setCurrentUrl(url);
      
      // Update route data based on new URL (async to not block navigation)
      const newRouteData = getRouteData(url);
      setRouteData(newRouteData);
      
      // Inject JavaScript after navigation - optimized timing
      if (!isPaymentDomain(url)) {
        setTimeout(() => {
          webViewRef.current?.injectJavaScript(WEBVIEW_INJECTION_SCRIPT);
        }, 100); // Reduced from 500ms to 100ms
      }
    }
    
    onNavigationStateChange?.(navState);
  };

  // Optimized allowlist check for navigation
  const onShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    
    // Fast path: Always allow the initial store URL
    if (url === business.storeUrl) {
      return true;
    }
    
    // Quick logout detection
    if (url.includes('auth/login') || url.includes('welcome/logout')) {
      handleLogout();
      return false;
    }

    // Fast external link detection using simple string checks
    if (url.startsWith('tel:') || url.startsWith('mailto:') || 
        url.startsWith('instagram:') || url.includes('facebook.com') ||
        url.includes('whatsapp.com') || url.includes('linkedin.com') ||
        url.includes('twitter.com') || url.includes('play.google') ||
        url.includes('apps.apple')) {
      Linking.openURL(url).catch(() => {});
      return false;
    }

    // Quick payment domain check (optimized for performance)
    if (url.includes('stripe.com') || url.includes('hcaptcha.com')) {
      return true; // Allow payment domains
    }

    // Streamlined host allowlist check
    const isAllowed = configService.isHostAllowed(business, url);
    
    if (!isAllowed) {
      Linking.openURL(url).catch(() => {});
      return false;
    }

    // Quick WebView parameter check for main routes
    if (!url.includes('isWebView=true')) {
      const newRouteData = getRouteData(url);
      if (newRouteData.isMainRoute) {
        const updatedUrl = addQueryParam(url, 'isWebView=true');
        setCurrentUrl(updatedUrl);
        return false;
      }
    }

    return true;
  };

  // Helper to check if any actions are loading
  const hasActiveActions = Object.keys(actionLoading).length > 0;
  const currentAction = Object.keys(actionLoading)[0] || 'booking';
  
  // compute derived flags for timeout handling
  const anyActionTimedOut = Object.keys(actionLoading).some(k => k.endsWith('_timedout') && actionLoading[k]);
  const anyActionRunning = Object.keys(actionLoading).some(k => !k.endsWith('_timedout') && actionLoading[k]);

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
          
          // Clear timeouts on successful load
          if (actionTimeoutRef.current) {
            clearTimeout(actionTimeoutRef.current as any);
            actionTimeoutRef.current = null;
            setActionLoading({});
            actionRetryRef.current = {};
          }
          if (navPollRef.current) {
            clearInterval(navPollRef.current as any);
            navPollRef.current = null;
          }
          
          onLoadEnd?.();
          
          // Inject JavaScript to hide web header/footer after loading - optimized timing
          setTimeout(() => {
            if (webViewRef.current) {
              if (isPaymentDomain(nativeEvent.url)) {
                console.log('Skipping onLoadEnd JavaScript injection on payment domain:', nativeEvent.url);
              } else {
                console.log('Injecting onLoadEnd JavaScript for:', nativeEvent.url);
                webViewRef.current.injectJavaScript(WEBVIEW_INJECTION_SCRIPT);
              }
            }
          }, 200); // Reduced from 1000ms to 200ms
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
          console.warn('WebView HTTP error:', {
            url: nativeEvent.url,
            statusCode: nativeEvent.statusCode,
            description: nativeEvent.description
          });
          
          // Handle different HTTP error codes appropriately
          const { statusCode, url } = nativeEvent;
          
          // For booking/checkout pages, be more resilient to temporary errors
          const isBookingPage = url.includes('checkout') || 
                               url.includes('reviewbooking') || 
                               url.includes('welcome/') ||
                               url.includes('booking');
          
          if (isBookingPage && (statusCode >= 500 && statusCode < 600)) {
            // 5xx errors are server errors - often temporary
            console.log('Server error on booking page - showing retry option');
            setActionLoading(prev => ({ ...prev, 'server_error': true }));
            setActionError(`Server temporarily unavailable (${statusCode}). Please try again.`);
          } else if (statusCode === 404) {
            // Page not found - might need to navigate back
            console.log('Page not found - showing error');
            setActionError('Page not found. Please try again or go back.');
          } else if (statusCode >= 400 && statusCode < 500) {
            // 4xx errors are client errors - less likely to be resolved by retry
            console.log('Client error - showing error message');
            setActionError(`Unable to load page (${statusCode}). Please try again later.`);
          } else {
            // For non-booking pages or other errors, use original error handler
            onError?.(nativeEvent);
          }
        }}
        onLoadProgress={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setLoadProgress(nativeEvent.progress);
          // Reduced console logging for performance
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
        // Performance optimizations
        javaScriptCanOpenWindowsAutomatically={true}
        allowsFullscreenVideo={true}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsBackForwardNavigationGestures={true}
      />

      {/* BottomMenu - show based on route data */}
      {routeData.showBottomMenu && (
        <BottomMenu
          isVisible={true}
          currentRoute={routeData.currentRoute}
          onTabPress={handleBottomMenuNavigation}
        />
      )}

      {/* Skeleton Loader - Full mode for initial loads only (skip on special pages) */}
      {showSkeleton && isInitialLoad && !isPaymentDomain(currentUrl) && !isAddonsPage(currentUrl) && (
        <SkeletonLoader
          isLoading={true}
          mode="full"
          showBottomMenu={routeData.showBottomMenu}
          showHeader={routeData.showHeader}
        />
      )}

      {/* Overlay Skeleton - For subsequent page loads (skip on special pages) */}
      {showSkeleton && !isInitialLoad && !isAddonsPage(currentUrl) && (
        <SkeletonLoader
          isLoading={true}
          mode="overlay"
        />
      )}

      {/* Action Overlay - For in-page actions like booking/checkout with timeout handling */}
      {!isPaymentDomain(currentUrl) && !isAddonsPage(currentUrl) && (
        <ActionOverlay
          visible={anyActionRunning || anyActionTimedOut}
          message={anyActionTimedOut ? 'Still processing — this is taking longer than expected' : 'Processing your booking…'}
          actionType={currentAction}
          error={actionError}
          onDismiss={() => {
            setActionError(null);
            setActionLoading({});
          }}
          onRetry={anyActionTimedOut ? () => {
            // Retry action: reload webview or inject navigation to checkout
            if (webViewRef.current) {
              console.log('User triggered Retry for booking');
              webViewRef.current.reload();
            }
            // hide the timedout UI
            setActionLoading({});
          } : undefined}
          onOpenInBrowser={anyActionTimedOut ? () => {
            // Use captured target or current url
            const action = Object.keys(actionLoading).find(k => k.endsWith('_timedout'))?.replace('_timedout', '') || 'default';
            const target = actionTargetRef.current[action];
            const urlToOpen = target ? (target.startsWith('http') ? target : new URL(target, business.storeUrl).href) : currentUrl;
            
            console.log('User triggered Open in Browser for:', urlToOpen);
            
            Linking.openURL(urlToOpen).catch(err => {
              console.error('Failed to open in browser:', err);
              Alert.alert('Error', 'Failed to open link in external browser');
            });

            // hide overlay
            setActionLoading({});
          } : undefined}
          onCancel={anyActionTimedOut ? () => {
            console.log('User cancelled timeout action');
            
            setActionLoading({});
            if (actionTimeoutRef.current) {
              clearTimeout(actionTimeoutRef.current as any);
              actionTimeoutRef.current = null;
            }
            if (navPollRef.current) {
              clearInterval(navPollRef.current as any);
              navPollRef.current = null;
            }
          } : undefined}
        />
      )}

      {/* Simplified Action Overlay for Addons Pages - only show if explicitly needed */}
      {isAddonsPage(currentUrl) && anyActionRunning && (
        <ActionOverlay
          visible={true}
          message="Processing selection…"
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
    position: 'relative', // Ensure proper positioning context for overlays
  },
});