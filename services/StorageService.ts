import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SELECTED_BUSINESS_ID: '@sogility/selectedBusinessId',
  LAST_CONFIG_UPDATE: '@sogility/lastConfigUpdate',
  AUTH_DATA: '@sogility/authData',
  AUTH_TOKEN: '@sogility/authToken',
} as const;

export class StorageService {
  /**
   * Save the selected business ID
   */
  static async saveSelectedBusinessId(businessId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_BUSINESS_ID, businessId);
    } catch (error) {
      console.error('Failed to save selected business ID:', error);
    }
  }

  /**
   * Get the saved business ID
   */
  static async getSelectedBusinessId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_BUSINESS_ID);
    } catch (error) {
      console.error('Failed to get selected business ID:', error);
      return null;
    }
  }

  /**
   * Clear the selected business ID
   */
  static async clearSelectedBusinessId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_BUSINESS_ID);
    } catch (error) {
      console.error('Failed to clear selected business ID:', error);
    }
  }

  /**
   * Save the last config update timestamp
   */
  static async saveLastConfigUpdate(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_CONFIG_UPDATE, Date.now().toString());
    } catch (error) {
      console.error('Failed to save config update timestamp:', error);
    }
  }

  /**
   * Get the last config update timestamp
   */
  static async getLastConfigUpdate(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CONFIG_UPDATE);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('Failed to get config update timestamp:', error);
      return null;
    }
  }

  /**
   * Save authentication data
   */
  static async saveAuthData(authData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify(authData));
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  /**
   * Get authentication data
   */
  static async getAuthData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get auth data:', error);
      return null;
    }
  }

  /**
   * Clear authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Save authentication token
   */
  static async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Failed to save auth token:', error);
    }
  }

  /**
   * Get authentication token
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await StorageService.getAuthToken();
      const authData = await StorageService.getAuthData();
      return !!(token && authData);
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }
}