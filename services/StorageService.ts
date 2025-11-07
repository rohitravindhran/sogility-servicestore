import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SELECTED_BUSINESS_ID: '@sogility/selectedBusinessId',
  LAST_CONFIG_UPDATE: '@sogility/lastConfigUpdate',
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
}