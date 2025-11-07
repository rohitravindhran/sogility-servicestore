import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Business, ConfigValidationResult, AppConfig } from '../types/config';
import bundledBusinesses from '../assets/businesses.json';

// Remote config URL - can be configured via environment or constants
const REMOTE_CONFIG_URL = 'https://config.sogility.com/businesses.json';

export class ConfigService {
  private static instance: ConfigService;
  private cachedConfig: Business[] | null = null;

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
    try {
      // Try to load from remote first
      console.log('Attempting to load remote config...');
      const remoteConfig = await this.loadRemoteConfig();
      if (remoteConfig.length > 0) {
        console.log(`Loaded ${remoteConfig.length} businesses from remote config`);
        this.cachedConfig = remoteConfig;
        return remoteConfig;
      }
    } catch (error) {
      console.warn('Failed to load remote config, falling back to bundled:', error);
    }

    // Fallback to bundled config
    return this.loadBundledConfig();
  }

  /**
   * Load configuration from remote URL
   */
  private async loadRemoteConfig(): Promise<Business[]> {
    const response = await fetch(REMOTE_CONFIG_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

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
    return this.loadConfig();
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