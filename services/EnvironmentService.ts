import Constants from 'expo-constants';

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  appDomainName: string;
  appDomainHost: string;
  baseUrlApi: string;
  baseUrlApp: string;
}

/**
 * URL configuration interface
 */
export interface UrlConfig {
  appDomainName: string;
  appDomainHost: string;
  login: string;
  getInfoForLogin: string;
  sendOTPForLogin: string;
  searchCustomer: string;
  checkOTP: string;
  sendOTP: string;
  verifyOTP: string;
  sendForgotPasswordLink: string;
  business: string;
  businessApp: string;
  businessDetails: string;
  sendDeviceToken: string;
  fetchCustomFields: string;
  registerUser: string;
}

/**
 * Get environment variable from multiple sources with fallback
 */
function getEnvironmentVariable(key: string, defaultValue: string): string {
  // Try to get from process.env first (for development)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  // Try to get from Expo Constants (for builds)
  const expoExtra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
  if (expoExtra[key]) {
    return expoExtra[key] as string;
  }

  // Return default value
  return defaultValue;
}

/**
 * Environment service for managing app configuration
 */
export class EnvironmentService {
  private static instance: EnvironmentService;
  private config: EnvironmentConfig | null = null;

  static getInstance(): EnvironmentService {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService();
    }
    return EnvironmentService.instance;
  }

  /**
   * Get environment configuration
   */
  getConfig(): EnvironmentConfig {
    if (!this.config) {
      this.config = {
        appDomainName: getEnvironmentVariable('EXPO_PUBLIC_APP_DOMAIN_NAME', '.getomnify.com'),
        appDomainHost: getEnvironmentVariable('EXPO_PUBLIC_APP_DOMAIN_HOST', 'https://app.getomnify.com'),
        baseUrlApi: getEnvironmentVariable('EXPO_PUBLIC_BASE_URL_API', 'https://api.getomnify.com/'),
        baseUrlApp: getEnvironmentVariable('EXPO_PUBLIC_BASE_URL_APP', 'https://app.getomnify.com/'),
      };
    }
    return this.config;
  }

  /**
   * Get URL configuration based on environment variables
   */
  getUrls(): UrlConfig {
    const config = this.getConfig();
    
    return {
      appDomainName: config.appDomainName,
      appDomainHost: config.appDomainHost,
      login: 'login',
      getInfoForLogin: `${config.baseUrlApp}v2/apiv2/nonsession.json?method=getInfoForLogin`,
      sendOTPForLogin: `${config.baseUrlApp}v2/apiv2/nonsession.json?method=sendOTP`,
      searchCustomer: `${config.baseUrlApi}v1/customers/search`,
      checkOTP: 'login/checkOTP/',
      sendOTP: `${config.baseUrlApp}v2/apiv2/nonsession.json?method=sendOTP`,
      verifyOTP: '/login/checkOTP/',
      sendForgotPasswordLink: `${config.baseUrlApp}v2/Apiv2/nonsession.json?method=sendResetPasswordMailToUser`,
      business: `${config.baseUrlApi}v1/businesses/`,
      businessApp: `${config.baseUrlApp}v1/businesses/`,
      businessDetails: '/meta',
      sendDeviceToken: '/device-tokens/',
      fetchCustomFields: '/customfields.json?page_location=signup',
      registerUser: `${config.baseUrlApp}v2/apiv2/nonsession.json?method=signupCustomer`,
    };
  }

  /**
   * Get individual environment variable
   */
  getEnvVar(key: string, defaultValue: string = ''): string {
    return getEnvironmentVariable(key, defaultValue);
  }

  /**
   * Check if we're in development mode
   */
  isDevelopment(): boolean {
    return __DEV__;
  }

  /**
   * Get current environment name
   */
  getEnvironment(): 'development' | 'staging' | 'production' | 'unknown' {
    const config = this.getConfig();
    
    if (config.appDomainHost.includes('dev-')) {
      return 'development';
    } else if (config.appDomainHost.includes('staging-')) {
      return 'staging';
    } else if (config.appDomainHost.includes('app.getomnify.com')) {
      return 'production';
    }
    
    return 'unknown';
  }

  /**
   * Log current configuration (for debugging)
   */
  logConfig(): void {
    if (__DEV__) {
      console.log('Environment Configuration:', {
        environment: this.getEnvironment(),
        config: this.getConfig(),
        expoConfig: Constants.expoConfig?.extra,
        processEnv: typeof process !== 'undefined' ? {
          EXPO_PUBLIC_APP_DOMAIN_NAME: process.env.EXPO_PUBLIC_APP_DOMAIN_NAME,
          EXPO_PUBLIC_APP_DOMAIN_HOST: process.env.EXPO_PUBLIC_APP_DOMAIN_HOST,
          EXPO_PUBLIC_BASE_URL_API: process.env.EXPO_PUBLIC_BASE_URL_API,
          EXPO_PUBLIC_BASE_URL_APP: process.env.EXPO_PUBLIC_BASE_URL_APP,
        } : 'N/A',
      });
    }
  }

  /**
   * Reset cached configuration (useful for testing or hot reloading)
   */
  resetConfig(): void {
    this.config = null;
  }
}

// Export convenience functions for direct use
export const getEnvironmentConfig = () => EnvironmentService.getInstance().getConfig();
export const getUrls = () => EnvironmentService.getInstance().getUrls();
export const getEnvVar = (key: string, defaultValue: string = '') => 
  EnvironmentService.getInstance().getEnvVar(key, defaultValue);

// Export singleton instance
export const environmentService = EnvironmentService.getInstance();