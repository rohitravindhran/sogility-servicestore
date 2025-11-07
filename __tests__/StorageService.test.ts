import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../services/StorageService';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSelectedBusinessId', () => {
    it('should save business ID to storage', async () => {
      const businessId = 'test-business';
      
      await StorageService.saveSelectedBusinessId(businessId);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@sogility/selectedBusinessId',
        businessId
      );
    });

    it('should handle storage errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(StorageService.saveSelectedBusinessId('test')).resolves.toBeUndefined();
      
      expect(consoleError).toHaveBeenCalledWith('Failed to save selected business ID:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('getSelectedBusinessId', () => {
    it('should retrieve business ID from storage', async () => {
      const businessId = 'test-business';
      mockAsyncStorage.getItem.mockResolvedValueOnce(businessId);

      const result = await StorageService.getSelectedBusinessId();

      expect(result).toBe(businessId);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@sogility/selectedBusinessId');
    });

    it('should return null when no business ID is stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await StorageService.getSelectedBusinessId();

      expect(result).toBeNull();
    });

    it('should handle storage errors and return null', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await StorageService.getSelectedBusinessId();

      expect(result).toBeNull();
      expect(consoleError).toHaveBeenCalledWith('Failed to get selected business ID:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('clearSelectedBusinessId', () => {
    it('should remove business ID from storage', async () => {
      await StorageService.clearSelectedBusinessId();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@sogility/selectedBusinessId');
    });

    it('should handle storage errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAsyncStorage.removeItem.mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(StorageService.clearSelectedBusinessId()).resolves.toBeUndefined();
      
      expect(consoleError).toHaveBeenCalledWith('Failed to clear selected business ID:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('saveLastConfigUpdate', () => {
    it('should save current timestamp', async () => {
      const mockDate = 1640995200000; // Jan 1, 2022
      jest.spyOn(Date, 'now').mockReturnValue(mockDate);

      await StorageService.saveLastConfigUpdate();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@sogility/lastConfigUpdate',
        mockDate.toString()
      );

      jest.restoreAllMocks();
    });

    it('should handle storage errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(StorageService.saveLastConfigUpdate()).resolves.toBeUndefined();
      
      expect(consoleError).toHaveBeenCalledWith('Failed to save config update timestamp:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('getLastConfigUpdate', () => {
    it('should retrieve and parse timestamp', async () => {
      const timestamp = 1640995200000;
      mockAsyncStorage.getItem.mockResolvedValueOnce(timestamp.toString());

      const result = await StorageService.getLastConfigUpdate();

      expect(result).toBe(timestamp);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@sogility/lastConfigUpdate');
    });

    it('should return null when no timestamp is stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await StorageService.getLastConfigUpdate();

      expect(result).toBeNull();
    });

    it('should handle invalid timestamp strings', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid-timestamp');

      const result = await StorageService.getLastConfigUpdate();

      expect(result).toBeNaN(); // parseInt returns NaN for invalid strings
    });

    it('should handle storage errors and return null', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await StorageService.getLastConfigUpdate();

      expect(result).toBeNull();
      expect(consoleError).toHaveBeenCalledWith('Failed to get config update timestamp:', expect.any(Error));
      consoleError.mockRestore();
    });
  });
});