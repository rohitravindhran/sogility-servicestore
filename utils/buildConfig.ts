import Constants from 'expo-constants';

/**
 * Get the pre-configured business ID from build-time environment variables
 * This allows builds like `npm run dev:acme` to automatically select the business
 */
export function getBuildBusinessId(): string | null {
  try {
    // Check for the EXPO_PUBLIC_BUSINESS_ID environment variable
    // In Expo, environment variables are available at build time through Constants
    let businessId = Constants.expoConfig?.extra?.EXPO_PUBLIC_BUSINESS_ID || 
                     Constants.manifest?.extra?.EXPO_PUBLIC_BUSINESS_ID ||
                     Constants.manifest2?.extra?.expoClient?.extra?.EXPO_PUBLIC_BUSINESS_ID;
    
    // Debug logging
    if (__DEV__) {
      console.log('🔧 Build Config Debug:', {
        'Constants.expoConfig?.extra': Constants.expoConfig?.extra,
        'Constants.manifest?.extra': Constants.manifest?.extra,
        'process.env.EXPO_PUBLIC_BUSINESS_ID': typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_BUSINESS_ID : 'N/A',
        'businessId from Constants': businessId,
        'type': typeof businessId,
        'is empty object': businessId && typeof businessId === 'object' && Object.keys(businessId).length === 0
      });
    }
    
    // Handle case where Constants has empty object {} instead of string
    if (businessId && typeof businessId === 'object' && Object.keys(businessId).length === 0) {
      console.log('⚠️ Constants businessId is empty object, falling back to process.env');
      businessId = null;
    }
    
    // Also check if it's defined in process.env (for development)
    if (!businessId && typeof process !== 'undefined' && process.env) {
      const processBusinessId = process.env.EXPO_PUBLIC_BUSINESS_ID;
      if (__DEV__) {
        console.log('🔍 Using process.env EXPO_PUBLIC_BUSINESS_ID:', processBusinessId);
      }
      businessId = processBusinessId;
    }
    
    // Final debug log
    if (__DEV__) {
      console.log('🎯 Final businessId result:', {
        businessId,
        isValid: businessId && typeof businessId === 'string' && businessId.trim() !== '',
        trimmed: businessId && typeof businessId === 'string' ? businessId.trim() : null
      });
    }
    
    // Ensure we return a proper string or null
    if (businessId && typeof businessId === 'string' && businessId.trim() !== '') {
      return businessId.trim();
    }
    
    return null;
  } catch (error) {
    console.warn('❌ Error getting build business ID:', error);
    return null;
  }
}

/**
 * Check if this build is configured for a specific business
 */
export function hasBuildBusinessId(): boolean {
  return getBuildBusinessId() !== null;
}

/**
 * Get the app name suffix based on business ID for white-label builds
 */
export function getAppDisplayName(businessId?: string): string {
  if (!businessId) return 'Service Store';
  
  switch (businessId) {
    case 'sogility':
      return 'Sogility';
    case 'hana':
      return 'Hana Care';
    case 'nuvanta':
      return 'Nuvanta';
    default:
      return 'Service Store';
  }
}