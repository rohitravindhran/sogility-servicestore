import { Asset } from 'expo-asset';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import AuthenticatedWebView from '@/components/AuthenticatedWebView';
import BusinessSelectionScreen from '@/components/BusinessSelectionScreen';
import DebugMenu from '@/components/DebugMenu';
import OfflineErrorScreen from '@/components/OfflineErrorScreen';
import ThemedHeader from '@/components/ThemedHeader';
import { ConfigService } from '@/services/ConfigService';
import { StorageService } from '@/services/StorageService';
import { Business } from '@/types/config';
import { getBuildBusinessId, hasBuildBusinessId } from '@/utils/buildConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthContainer from './auth/AuthContainer';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type AppState = 'loading' | 'selecting' | 'auth' | 'webview' | 'error';

export default function RootLayout() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>('loading');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [authData, setAuthData] = useState<any>(null);
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
      console.log('🚀 Initializing app...');
      
      // DEBUG: Check environment variables
      console.log('🔍 Environment Debug:', {
        EXPO_PUBLIC_BUSINESS_ID_process: process.env.EXPO_PUBLIC_BUSINESS_ID,
        NODE_ENV: process.env.NODE_ENV,
        allProcessEnv: Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC')),
      });
      
      // Load configuration
      const businessList = await configService.loadConfig();
      setBusinesses(businessList);
      console.log('📋 Available businesses:', businessList.map(b => b.id));
      
      // Pre-download logos
      console.log('📥 Pre-downloading business logos...');
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
      
      // Check for business selection priority: build config > deep link > saved business > default to sogility
      let businessToSelect: Business | null = null;
      
      // 1. Check for build-time business configuration (highest priority)
      const buildBusinessId = getBuildBusinessId();
      console.log('🏢 Build business ID check:', {
        buildBusinessId,
        hasBuildBusinessId: hasBuildBusinessId(),
      });
      
      if (buildBusinessId) {
        console.log(`✅ Build configured for business: ${buildBusinessId}`);
        businessToSelect = await configService.findBusiness(buildBusinessId);
        if (!businessToSelect) {
          console.warn(`❌ Build business not found: ${buildBusinessId}`);
        } else {
          console.log(`✅ Found business for build config:`, {
            id: businessToSelect.id,
            displayName: businessToSelect.displayName,
            storeUrl: businessToSelect.storeUrl,
          });
        }
      } else {
        console.log('⚠️ No build business ID detected');
      }
      
      // 2. Check if we have a deep link business ID (only if no build config)
      if (!businessToSelect && deepLinkBusinessId.current) {
        console.log(`🔗 Checking deep link business: ${deepLinkBusinessId.current}`);
        businessToSelect = await configService.findBusiness(deepLinkBusinessId.current);
        if (!businessToSelect) {
          console.warn(`❌ Business not found for deep link: ${deepLinkBusinessId.current}`);
        }
      }
      
      // 3. If no build config or deep link, check for saved business (BUT ONLY IF NO BUILD CONFIG!)
      if (!businessToSelect && !hasBuildBusinessId()) {
        const savedBusinessId = await StorageService.getSelectedBusinessId();
        console.log(`💾 Checking saved business ID: ${savedBusinessId}`);
        if (savedBusinessId) {
          businessToSelect = await configService.findBusiness(savedBusinessId);
          if (businessToSelect) {
            console.log(`✅ Found saved business: ${businessToSelect.id}`);
          }
        }
      } else if (hasBuildBusinessId()) {
        // If we have build config, we should clear any saved business to avoid conflicts
        console.log('🧹 Build config detected, clearing any saved business ID to avoid conflicts');
        await StorageService.clearSelectedBusinessId();
      }
      
      // 4. Default to sogility business if no other selection (NEW: Skip business selection)
      if (!businessToSelect) {
        console.log('No business found, defaulting to sogility business');
        businessToSelect = await configService.findBusiness('sogility');
        if (!businessToSelect) {
          console.warn('Default sogility business not found in config');
        }
      }
      
      // Hide splash screen
      await SplashScreen.hideAsync();
      console.log('Splash screen hidden');
      
      if (businessToSelect) {
        console.log(`✅ Selected business: ${businessToSelect.id} (${businessToSelect.displayName})`);
        console.log(`🔗 Store URL: ${businessToSelect.storeUrl}`);
        setSelectedBusiness(businessToSelect);
        
        // Check if user is already authenticated for this business
        const existingAuth = await StorageService.getAuthData();
        console.log('🔑 Existing auth data:', {
          exists: !!existingAuth,
          businessId: existingAuth?.business?.id,
          matchesSelectedBusiness: existingAuth?.business?.id === businessToSelect.id
        });
        
        if (existingAuth && existingAuth.business?.id === businessToSelect.id) {
          console.log('✅ Using existing auth for same business');
          setAuthData(existingAuth);
          setAppState('webview');
        } else {
          if (existingAuth && existingAuth.business?.id !== businessToSelect.id) {
            console.log('🧹 Clearing auth data for different business');
            await StorageService.clearAuthData();
          }
          console.log('🔐 Proceeding to auth screen');
          setAppState('auth');
        }
      } else if (hasBuildBusinessId()) {
        // Build is configured for a specific business but business not found
        console.error(`Build configured business not found: ${buildBusinessId}`);
        setError(new Error(`Configured business "${buildBusinessId}" not found`));
        setAppState('error');
      } else {
        // Fallback: if sogility business not found, show error instead of selection
        console.error('No businesses available including default sogility business');
        setError(new Error('No businesses configured'));
        setAppState('error');
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
      
      // Check if user is already authenticated for this business
      const existingAuth = await StorageService.getAuthData();
      if (existingAuth && existingAuth.business?.id === business.id) {
        setAuthData(existingAuth);
        setAppState('webview');
      } else {
        setAppState('auth');
      }
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

  const handleRetry = async () => {
    if (selectedBusiness) {
      setError(null);
      // Check authentication before going to webview
      const existingAuth = await StorageService.getAuthData();
      if (existingAuth && existingAuth.business?.id === selectedBusiness.id) {
        setAuthData(existingAuth);
        setAppState('webview');
      } else {
        setAppState('auth');
      }
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
    await StorageService.clearAuthData();
    setSelectedBusiness(null);
    setAuthData(null);
    setShowDebugMenu(false);
    setAppState('selecting');
  };

  const handleAuthSuccess = (authenticationData: any) => {
    setAuthData(authenticationData);
    setError(null);
    setAppState('webview');
  };

  const handleAuthBack = () => {
    setSelectedBusiness(null);
    setAppState('selecting');
  };



  const handleLogout = async () => {
    await StorageService.clearAuthData();
    setAuthData(null);
    if (selectedBusiness) {
      setAppState('auth');
    } else {
      setAppState('selecting');
    }
    setShowDebugMenu(false);
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

      case 'auth':
        return selectedBusiness ? (
          <AuthContainer
            business={selectedBusiness}
            onAuthSuccess={handleAuthSuccess}
            onBack={handleAuthBack}
          />
        ) : null;
        
      case 'webview':
        return selectedBusiness && authData ? (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <AuthenticatedWebView
              business={selectedBusiness}
              authData={authData}
              onError={handleWebViewError}
              onLoadStart={() => setIsWebViewLoading(true)}
              onLoadEnd={() => setIsWebViewLoading(false)}
              onLogout={handleLogout}
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
        onLogout={authData ? handleLogout : undefined}
      />
    </View>
  );
}
