import bundledBusinesses from '../assets/businesses.json';
import { Business, ConfigValidationResult } from '../types/config';

// Remote config URL - can be configured via environment or constants
// Note: This URL may not be available in development/demo mode
const REMOTE_CONFIG_URL = 'https://config.sogility.com/businesses.json';

// Timeout for remote config requests (5 seconds)
const REMOTE_CONFIG_TIMEOUT = 5000;

export class ConfigService {
  private static instance: ConfigService;
  private cachedConfig: Business[] | null = null;
  private isLoadingConfig = false;
  private configLoadPromise: Promise<Business[]> | null = null;

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Load businesses configuration with fallback to bundled assets
   */
  async loadConfig(): Promise<Business[]> {
    // If we already have cached config, return it
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    // If we're already loading, wait for the existing promise
    if (this.isLoadingConfig && this.configLoadPromise) {
      return this.configLoadPromise;
    }

    this.isLoadingConfig = true;
    this.configLoadPromise = this.performConfigLoad();

    try {
      const result = await this.configLoadPromise;
      this.isLoadingConfig = false;
      return result;
    } catch (error) {
      this.isLoadingConfig = false;
      this.configLoadPromise = null;
      throw error;
    }
  }

  /**
   * Perform the actual config loading with proper fallback
   */
  private async performConfigLoad(): Promise<Business[]> {
    // Try to load from remote first, but with timeout and graceful fallback
    try {
      console.log('Attempting to load remote config...');
      const remoteConfig = await this.loadRemoteConfigWithTimeout();
      if (remoteConfig && remoteConfig.length > 0) {
        console.log(`✓ Loaded ${remoteConfig.length} businesses from remote config`);
        this.cachedConfig = remoteConfig;
        return remoteConfig;
      }
    } catch (error) {
      // Log the error but don't throw - we'll fall back to bundled config
      console.warn('⚠️ Failed to load remote config, falling back to bundled:', 
        error instanceof Error ? error.message : String(error));
    }

    // Fallback to bundled config
    console.log('📦 Loading bundled configuration...');
    const bundledConfig = await this.loadBundledConfig();
    console.log(`✓ Loaded ${bundledConfig.length} businesses from bundled config`);
    return bundledConfig;
  }

  /**
   * Load configuration from remote URL with timeout
   */
  private async loadRemoteConfigWithTimeout(): Promise<Business[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REMOTE_CONFIG_TIMEOUT);

    try {
      const response = await fetch(REMOTE_CONFIG_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const validation = this.validateConfig(data);
      
      if (!validation.isValid) {
        console.error('Invalid remote config:', validation.errors);
        throw new Error(`Invalid remote config: ${validation.errors.join(', ')}`);
      }

      return data.filter((business: Business) => business.status !== 'disabled');
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Remote config request timed out after ${REMOTE_CONFIG_TIMEOUT}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Load configuration from remote URL (legacy method for compatibility)
   */
  private async loadRemoteConfig(): Promise<Business[]> {
    return this.loadRemoteConfigWithTimeout();
  }

  /**
   * Load bundled configuration from assets
   */
  private async loadBundledConfig(): Promise<Business[]> {
    try {
      console.log('Loading bundled config...');
      
      // Use the imported JSON directly
      const data = bundledBusinesses as Business[];
      
      const validation = this.validateConfig(data);
      if (!validation.isValid) {
        console.error('Invalid bundled config:', validation.errors);
        throw new Error(`Invalid bundled config: ${validation.errors.join(', ')}`);
      }

      const activeBusinesses = data.filter((business: Business) => business.status !== 'disabled');
      console.log(`Loaded ${activeBusinesses.length} businesses from bundled config`);
      this.cachedConfig = activeBusinesses;
      return activeBusinesses;
    } catch (error) {
      console.error('Failed to load bundled config:', error);
      throw error;
    }
  }

  /**
   * Validate business configuration structure
   */
  validateConfig(data: any): ConfigValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Config must be an array of business objects');
      return { isValid: false, errors };
    }

    data.forEach((business: any, index: number) => {
      const prefix = `Business ${index + 1}:`;
      
      if (!business.id || typeof business.id !== 'string') {
        errors.push(`${prefix} missing or invalid id`);
      }
      
      if (!business.displayName || typeof business.displayName !== 'string') {
        errors.push(`${prefix} missing or invalid displayName`);
      }
      
      if (!business.primaryColor || typeof business.primaryColor !== 'string') {
        errors.push(`${prefix} missing or invalid primaryColor`);
      }
      
      if (!business.secondaryColor || typeof business.secondaryColor !== 'string') {
        errors.push(`${prefix} missing or invalid secondaryColor`);
      }
      
      if (!business.logoUrl || typeof business.logoUrl !== 'string') {
        errors.push(`${prefix} missing or invalid logoUrl`);
      }
      
      if (!business.storeUrl || typeof business.storeUrl !== 'string') {
        errors.push(`${prefix} missing or invalid storeUrl`);
      } else {
        // Validate URL format
        try {
          const url = new URL(business.storeUrl);
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push(`${prefix} storeUrl must use http or https protocol`);
          }
        } catch {
          errors.push(`${prefix} invalid storeUrl format`);
        }
      }
      
      if (!Array.isArray(business.allowedHosts)) {
        errors.push(`${prefix} allowedHosts must be an array`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Find business by ID
   */
  async findBusiness(id: string): Promise<Business | null> {
    const businesses = this.cachedConfig || await this.loadConfig();
    return businesses.find(business => business.id === id) || null;
  }

  /**
   * Get all available businesses
   */
  async getBusinesses(): Promise<Business[]> {
    return this.cachedConfig || await this.loadConfig();
  }

  /**
   * Force refresh configuration from remote
   */
  async refreshConfig(): Promise<Business[]> {
    this.cachedConfig = null;
    this.isLoadingConfig = false;
    this.configLoadPromise = null;
    return this.loadConfig();
  }

  /**
   * Check if remote config is available/reachable
   */
  async checkRemoteConfigAvailability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter timeout for availability check

      const response = await fetch(REMOTE_CONFIG_URL, {
        method: 'HEAD', // Just check if endpoint exists
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get configuration source information
   */
  getConfigSource(): 'remote' | 'bundled' | 'unknown' {
    if (!this.cachedConfig) {
      return 'unknown';
    }
    
    // This is a simple heuristic - in a real app you might want to track this more precisely
    return this.cachedConfig.length > 2 ? 'remote' : 'bundled';
  }

  /**
   * Check if host is allowed for a business
   */
  isHostAllowed(business: Business, url: string): boolean {
    try {
      const urlObj = new URL(url);
      return business.allowedHosts.some(host => 
        urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`)
      );
    } catch {
      return false;
    }
  }
}