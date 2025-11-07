import { Business } from '@/types/config';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface AuthenticatedWebViewProps {
  business: Business;
  authData: any;
  onError: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onNavigationStateChange?: (navState: any) => void;
}

export default function AuthenticatedWebView({
  business,
  authData,
  onError,
  onLoadStart,
  onLoadEnd,
  onNavigationStateChange
}: AuthenticatedWebViewProps) {
  const webViewRef = useRef<WebView>(null);

  // Inject authentication cookies into WebView
  useEffect(() => {
    if (webViewRef.current && authData?.cookies) {
      // Set cookies for the domain
      const cookieString = authData.cookies;
      const jsCode = `
        // Set authentication cookies
        const cookies = '${cookieString}';
        const cookiePairs = cookies.split(';');
        for (const pair of cookiePairs) {
          const [name, value] = pair.split('=');
          if (name && value) {
            document.cookie = name.trim() + '=' + value.trim() + '; path=/; domain=' + window.location.hostname;
          }
        }
        true; // Return true to indicate successful execution
      `;
      webViewRef.current.postMessage(jsCode);
    }
  }, [authData]);

  // Enhanced user agent with auth info
  const getAuthenticatedUserAgent = (): string => {
    const baseUserAgent = `SogilityServiceStore/1.0 (${Platform.OS === 'ios' ? 'iOS' : 'Android'})`;
    const authInfo = authData?.email ? ` Auth-User:${authData.email}` : '';
    return business.customUserAgent 
      ? `${baseUserAgent}${authInfo} ${business.customUserAgent}`
      : `${baseUserAgent}${authInfo}`;
  };

  // Inject additional authentication JavaScript
  const enhancedInjectedJavaScript = `
    (function() {
      // Set authentication cookies if available
      ${authData?.cookies ? `
        const authCookies = '${authData.cookies}';
        const cookiePairs = authCookies.split(';');
        for (const pair of cookiePairs) {
          const [name, value] = pair.split('=');
          if (name && value) {
            document.cookie = name.trim() + '=' + value.trim() + '; path=/; domain=' + window.location.hostname;
          }
        }
      ` : ''}

      // Set auth headers for fetch requests
      const originalFetch = window.fetch;
      window.fetch = function(url, options = {}) {
        options.headers = {
          ...options.headers,
          'X-Auth-User': '${authData?.email || ''}',
          'X-App-Version': 'SogilityServiceStore/1.0'
        };
        return originalFetch(url, options);
      };

      // Set auth headers for XMLHttpRequest
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        originalOpen.call(this, method, url, async, user, password);
        this.setRequestHeader('X-Auth-User', '${authData?.email || ''}');
        this.setRequestHeader('X-App-Version', 'SogilityServiceStore/1.0');
      };

      // Post authentication status to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'AUTH_STATUS',
          authenticated: true,
          user: '${authData?.email || ''}'
        }));
      }

      // Standard WebView Shell enhancements
      const sendTitle = () => {
        const title = document.title;
        if (title && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAGE_TITLE',
            title: title
          }));
        }
      };

      sendTitle();
      const observer = new MutationObserver(() => sendTitle());
      observer.observe(document.querySelector('title') || document.head, {
        childList: true,
        subtree: true
      });

      // Intercept external links
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
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: business.storeUrl }}
        userAgent={getAuthenticatedUserAgent()}
        injectedJavaScript={enhancedInjectedJavaScript}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            
            switch (data.type) {
              case 'AUTH_STATUS':
                console.log('WebView authentication status:', data);
                break;
                
              case 'PAGE_TITLE':
                console.log('Page title changed:', data.title);
                break;
                
              case 'EXTERNAL_LINK':
                console.log('Opening external link:', data.url);
                // Handle external link opening
                break;
                
              default:
                console.log('Unknown message from WebView:', data);
            }
          } catch (error) {
            console.error('Failed to parse WebView message:', error);
          }
        }}
        onNavigationStateChange={onNavigationStateChange}
        onLoadStart={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('Authenticated WebView load started:', nativeEvent.url);
          onLoadStart?.();
        }}
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('Authenticated WebView load ended:', nativeEvent.url);
          onLoadEnd?.();
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('Authenticated WebView error:', nativeEvent);
          onError?.(nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('Authenticated WebView HTTP error:', nativeEvent);
          onError?.(nativeEvent);
        }}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        mixedContentMode="compatibility"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});