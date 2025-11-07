import AsyncStorage from '@react-native-async-storage/async-storage';
import { Strings } from './Strings';

export const AsyncValues = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      return await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log('AsyncStorage#setItem error: ' + error);
    }
  },
  async getItem(key: string): Promise<any | null> {
    return await AsyncStorage.getItem(key).then((result) => {
      if (result) {
        try {
          result = JSON.parse(result);
        } catch (e) {
          console.log(
            'AsyncStorage#getItem error deserializing JSON for key: ' + key,
            e,
          );
        }
      }
      return result;
    });
  },
  async removeItem(key: string): Promise<void> {
    return await AsyncStorage.removeItem(key);
  },
  async removeCredentials(): Promise<void> {
    const keys = [
      Strings.token,
      Strings.businessIDs,
      Strings.businessName,
      Strings.lastApiCallTime,
    ];
    return await AsyncStorage.multiRemove(keys).then((res) => {
      console.log('Items removed from storage');
    });
  },
  async clearItems(): Promise<void> {
    return await AsyncStorage.clear();
  },
};
