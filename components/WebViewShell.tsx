import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { Business } from '../types/config';
import { ConfigService } from '../services/ConfigService';

interface WebViewShellProps {
  business: Business;
  onError: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onNavigationStateChange?: (navState: any) => void;
}

export default function WebViewShell({ 
  business, 
  onError,
  onLoadStart,
  onLoadEnd,
  onNavigationStateChange 
}: WebViewShellProps) {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const configService = ConfigService.getInstance();

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

  // Injected JavaScript for page interaction
  const injectedJavaScript = `
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
      });

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
          
        default:
          console.log('Unknown message from WebView:', data);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  // Navigation state change handler
  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    onNavigationStateChange?.(navState);
  };

  // Allowlist check for navigation
  const onShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    
    // Always allow the initial store URL
    if (url === business.storeUrl) {
      return true;
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
      'api.stripe.com'
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

    return true;
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: business.storeUrl }}
        userAgent={getUserAgent()}
        injectedJavaScript={injectedJavaScript}
        onMessage={onMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onError={onError}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error:', nativeEvent);
          onError?.(nativeEvent);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});