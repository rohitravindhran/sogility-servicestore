export interface Business {
  id: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  storeUrl: string;
  allowedHosts: string[];
  customUserAgent?: string;
  status?: 'active' | 'disabled';
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AppConfig {
  businesses: Business[];
  remoteConfigUrl?: string;
}