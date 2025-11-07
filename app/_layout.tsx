import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { Asset } from 'expo-asset';
import 'react-native-reanimated';

import { Business } from '@/types/config';
import { ConfigService } from '@/services/ConfigService';
import { StorageService } from '@/services/StorageService';
import { getBuildBusinessId, hasBuildBusinessId } from '@/utils/buildConfig';
import BusinessSelectionScreen from '@/components/BusinessSelectionScreen';
import WebViewShell from '@/components/WebViewShell';
import ThemedHeader from '@/components/ThemedHeader';
import OfflineErrorScreen from '@/components/OfflineErrorScreen';
import DebugMenu from '@/components/DebugMenu';
import { SafeAreaView } from 'react-native-safe-area-context';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type AppState = 'loading' | 'selecting' | 'webview' | 'error';

export default function RootLayout() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [error, setError] = useState<any>(null);
  const [isWebViewLoading, setIsWebViewLoading] = useState(false);
  const [showDebugMenu, setShowDebugMenu] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  
  const configService = ConfigService.getInstance();
  const deepLinkBusinessId = useRef<string | null>(null);

  // Initialize app
  useEffect(() => {
    initializeApp();
    setupDeepLinking();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing app...');
      
      // Load configuration
      const businessList = await configService.loadConfig();
      setBusinesses(businessList);
      
      // Pre-download logos
      console.log('Pre-downloading business logos...');
      await Promise.allSettled(
        businessList.map(async (business) => {
          try {
            const asset = Asset.fromURI(business.logoUrl);
            await asset.downloadAsync();
          } catch (error) {
            console.warn(`Failed to preload logo for ${business.id}:`, error);
          }
        })
      );
      
      // Check for business selection priority: build config > deep link > saved business
      let businessToSelect: Business | null = null;
      
      // 1. Check for build-time business configuration (highest priority)
      const buildBusinessId = getBuildBusinessId();
      if (buildBusinessId) {
        console.log(`Build configured for business: ${buildBusinessId}`);
        businessToSelect = await configService.findBusiness(buildBusinessId);
        if (!businessToSelect) {
          console.warn(`Build business not found: ${buildBusinessId}`);
        }
      }
      
      // 2. Check if we have a deep link business ID (only if no build config)
      if (!businessToSelect && deepLinkBusinessId.current) {
        businessToSelect = await configService.findBusiness(deepLinkBusinessId.current);
        if (!businessToSelect) {
          console.warn(`Business not found for deep link: ${deepLinkBusinessId.current}`);
        }
      }
      
      // 3. If no build config or deep link, check for saved business
      if (!businessToSelect && !hasBuildBusinessId()) {
        const savedBusinessId = await StorageService.getSelectedBusinessId();
        if (savedBusinessId) {
          businessToSelect = await configService.findBusiness(savedBusinessId);
        }
      }
      
      // Hide splash screen
      await SplashScreen.hideAsync();
      console.log('Splash screen hidden');
      
      if (businessToSelect) {
        setSelectedBusiness(businessToSelect);
        setAppState('webview');
      } else if (hasBuildBusinessId()) {
        // Build is configured for a specific business but business not found
        console.error(`Build configured business not found: ${buildBusinessId}`);
        setError(new Error(`Configured business "${buildBusinessId}" not found`));
        setAppState('error');
      } else {
        setAppState('selecting');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      await SplashScreen.hideAsync();
      setError(error);
      setAppState('error');
    }
  };

  const setupDeepLinking = () => {
    // Handle deep links when app is already running
    const handleDeepLink = (url: string) => {
      const parsed = Linking.parse(url);
      const businessId = parsed.queryParams?.biz as string;
      
      if (businessId) {
        console.log('Deep link received:', businessId);
        handleBusinessSelection(businessId);
      }
    };

    // Get initial URL (when app is opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        const parsed = Linking.parse(url);
        const businessId = parsed.queryParams?.biz as string;
        if (businessId) {
          console.log('Initial deep link:', businessId);
          deepLinkBusinessId.current = businessId;
        }
      }
    });

    // Listen for deep links when app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  };

  const handleBusinessSelection = async (businessIdOrBusiness: string | Business) => {
    try {
      let business: Business | null;
      
      if (typeof businessIdOrBusiness === 'string') {
        business = await configService.findBusiness(businessIdOrBusiness);
        if (!business) {
          throw new Error(`Business not found: ${businessIdOrBusiness}`);
        }
      } else {
        business = businessIdOrBusiness;
      }
      
      // Save selection
      await StorageService.saveSelectedBusinessId(business.id);
      
      setSelectedBusiness(business);
      setError(null);
      setAppState('webview');
    } catch (error) {
      console.error('Failed to select business:', error);
      setError(error);
      setAppState('error');
    }
  };

  const handleWebViewError = (webViewError: any) => {
    console.error('WebView error:', webViewError);
    setError(webViewError);
    setAppState('error');
  };

  const handleRetry = () => {
    if (selectedBusiness) {
      setError(null);
      setAppState('webview');
    } else {
      setAppState('selecting');
    }
  };

  const handleRefreshConfig = async () => {
    try {
      const refreshedBusinesses = await configService.refreshConfig();
      setBusinesses(refreshedBusinesses);
      
      // Revalidate selected business
      if (selectedBusiness) {
        const updatedBusiness = refreshedBusinesses.find(b => b.id === selectedBusiness.id);
        if (updatedBusiness) {
          setSelectedBusiness(updatedBusiness);
        } else {
          // Business no longer exists, go back to selection
          await StorageService.clearSelectedBusinessId();
          setSelectedBusiness(null);
          setAppState('selecting');
        }
      }
    } catch (error) {
      console.error('Failed to refresh config:', error);
      throw error;
    }
  };

  const handleSwitchBusiness = async () => {
    await StorageService.clearSelectedBusinessId();
    setSelectedBusiness(null);
    setShowDebugMenu(false);
    setAppState('selecting');
  };

  const handleHeaderLogoLongPress = () => {
    if (__DEV__) {
      setShowDebugMenu(true);
    }
  };

  // Render based on app state
  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return null; // Splash screen is still visible
        
      case 'selecting':
        return (
          <BusinessSelectionScreen
            onBusinessSelected={handleBusinessSelection}
          />
        );
        
      case 'webview':
        return selectedBusiness ? (
          <SafeAreaView style={{ flex: 1 }}>
            {/* <ThemedHeader
              business={selectedBusiness}
              onLogoLongPress={handleHeaderLogoLongPress}
            /> */}
            <WebViewShell
              business={selectedBusiness}
              onError={handleWebViewError}
              onLoadStart={() => setIsWebViewLoading(true)}
              onLoadEnd={() => setIsWebViewLoading(false)}
            />
          </SafeAreaView>
        ) : null;
        
      case 'error':
        return selectedBusiness ? (
          <View style={{ flex: 1 }}>
            <ThemedHeader
              business={selectedBusiness}
              onLogoLongPress={handleHeaderLogoLongPress}
            />
            <OfflineErrorScreen
              business={selectedBusiness}
              error={error}
              onRetry={handleRetry}
              onRefreshConfig={handleRefreshConfig}
            />
          </View>
        ) : (
          <BusinessSelectionScreen
            onBusinessSelected={handleBusinessSelection}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      
      <DebugMenu
        isVisible={showDebugMenu}
        onClose={() => setShowDebugMenu(false)}
        business={selectedBusiness}
        onRefreshConfig={handleRefreshConfig}
        onSwitchBusiness={handleSwitchBusiness}
      />
    </View>
  );
}
