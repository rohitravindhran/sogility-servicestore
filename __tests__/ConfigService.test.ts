import { ConfigService } from '../services/ConfigService';
import { Business } from '../types/config';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock bundled businesses JSON
jest.mock('../assets/businesses.json', () => [
  {
    id: 'test1',
    displayName: 'Test Business 1',
    primaryColor: '#1E90FF',
    secondaryColor: '#0D47A1',
    logoUrl: 'https://example.com/logo1.png',
    storeUrl: 'https://test1.example.com/store',
    allowedHosts: ['test1.example.com'],
    status: 'active',
  },
  {
    id: 'test2',
    displayName: 'Test Business 2',
    primaryColor: '#F57C00',
    secondaryColor: '#E65100',
    logoUrl: 'https://example.com/logo2.png',
    storeUrl: 'https://test2.example.com/store',
    allowedHosts: ['test2.example.com', 'api.test2.example.com'],
    status: 'active',
  },
]);

// Mock Asset (still needed for logo preloading)
const mockAsset = {
  localUri: 'mock://local-uri',
  downloadAsync: jest.fn(),
};

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => mockAsset),
    fromURI: jest.fn(() => mockAsset),
  },
}));

describe('ConfigService', () => {
  let configService: ConfigService;
  const mockBusinesses: Business[] = [
    {
      id: 'test1',
      displayName: 'Test Business 1',
      primaryColor: '#1E90FF',
      secondaryColor: '#0D47A1',
      logoUrl: 'https://example.com/logo1.png',
      storeUrl: 'https://test1.example.com/store',
      allowedHosts: ['test1.example.com'],
      status: 'active',
    },
    {
      id: 'test2',
      displayName: 'Test Business 2',
      primaryColor: '#F57C00',
      secondaryColor: '#E65100',
      logoUrl: 'https://example.com/logo2.png',
      storeUrl: 'https://test2.example.com/store',
      allowedHosts: ['test2.example.com', 'api.test2.example.com'],
      status: 'active',
    },
  ];

  beforeEach(() => {
    configService = ConfigService.getInstance();
    // Reset cached config
    (configService as any).cachedConfig = null;
    jest.clearAllMocks();
    
    // Ensure asset mock is properly set up
    mockAsset.downloadAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('loadConfig', () => {
    it('should load remote config when available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBusinesses,
      } as Response);

      const result = await configService.loadConfig();

      expect(result).toEqual(mockBusinesses);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('businesses.json'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          }),
        })
      );
    });

    it('should fallback to bundled config when remote fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Mock bundled asset response
      const mockResponse = {
        json: async () => mockBusinesses,
      };
      global.fetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse);

      const result = await configService.loadConfig();

      expect(result).toEqual(mockBusinesses);
    });

    it('should filter out disabled businesses', async () => {
      const businessesWithDisabled = [
        ...mockBusinesses,
        {
          ...mockBusinesses[0],
          id: 'disabled',
          status: 'disabled' as const,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => businessesWithDisabled,
      } as Response);

      const result = await configService.loadConfig();

      expect(result).toHaveLength(2);
      expect(result.find(b => b.id === 'disabled')).toBeUndefined();
    });

    it('should throw error for invalid remote config', async () => {
      const invalidConfig = [
        {
          id: 'invalid',
          // missing required fields
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidConfig,
      } as Response);

      await expect(configService.loadConfig()).rejects.toThrow('Invalid remote config');
    });
  });

  describe('validateConfig', () => {
    it('should validate correct config', () => {
      const result = configService.validateConfig(mockBusinesses);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-array config', () => {
      const result = configService.validateConfig({ notAnArray: true });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Config must be an array of business objects');
    });

    it('should validate required fields', () => {
      const invalidBusiness = {
        id: 'test',
        // missing required fields
      };

      const result = configService.validateConfig([invalidBusiness]);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.join(' ')).toContain('missing or invalid displayName');
    });

    it('should validate URL format', () => {
      const businessWithInvalidUrl = {
        ...mockBusinesses[0],
        storeUrl: 'not-a-valid-url',
      };

      const result = configService.validateConfig([businessWithInvalidUrl]);

      expect(result.isValid).toBe(false);
      expect(result.errors.join(' ')).toContain('invalid storeUrl format');
    });

    it('should validate URL protocol', () => {
      const businessWithInvalidProtocol = {
        ...mockBusinesses[0],
        storeUrl: 'ftp://example.com/store',
      };

      const result = configService.validateConfig([businessWithInvalidProtocol]);

      expect(result.isValid).toBe(false);
      expect(result.errors.join(' ')).toContain('storeUrl must use http or https protocol');
    });

    it('should validate allowedHosts is array', () => {
      const businessWithInvalidHosts = {
        ...mockBusinesses[0],
        allowedHosts: 'not-an-array' as any,
      };

      const result = configService.validateConfig([businessWithInvalidHosts]);

      expect(result.isValid).toBe(false);
      expect(result.errors.join(' ')).toContain('allowedHosts must be an array');
    });
  });

  describe('findBusiness', () => {
    beforeEach(() => {
      // Mock cached config
      (configService as any).cachedConfig = mockBusinesses;
    });

    it('should find existing business by ID', async () => {
      const result = await configService.findBusiness('test1');

      expect(result).toEqual(mockBusinesses[0]);
    });

    it('should return null for non-existing business', async () => {
      const result = await configService.findBusiness('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('isHostAllowed', () => {
    const business = mockBusinesses[1]; // Has multiple allowed hosts

    it('should allow exact host match', () => {
      const result = configService.isHostAllowed(business, 'https://test2.example.com/page');

      expect(result).toBe(true);
    });

    it('should allow subdomain match', () => {
      const result = configService.isHostAllowed(business, 'https://api.test2.example.com/api');

      expect(result).toBe(true);
    });

    it('should reject non-allowed host', () => {
      const result = configService.isHostAllowed(business, 'https://malicious.com/page');

      expect(result).toBe(false);
    });

    it('should handle invalid URLs', () => {
      const result = configService.isHostAllowed(business, 'not-a-valid-url');

      expect(result).toBe(false);
    });

    it('should allow subdomain of allowed host', () => {
      const businessWithWildcard = {
        ...business,
        allowedHosts: ['example.com'],
      };

      const result = configService.isHostAllowed(businessWithWildcard, 'https://sub.example.com/page');

      expect(result).toBe(true);
    });

    it('should not allow partial domain matches', () => {
      const businessWithSpecificHost = {
        ...business,
        allowedHosts: ['test.com'],
      };

      const result = configService.isHostAllowed(businessWithSpecificHost, 'https://malicioustest.com/page');

      expect(result).toBe(false);
    });
  });

  describe('refreshConfig', () => {
    it('should clear cache and reload config', async () => {
      // Set initial cached config
      (configService as any).cachedConfig = [mockBusinesses[0]];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBusinesses,
      } as Response);

      const result = await configService.refreshConfig();

      expect(result).toEqual(mockBusinesses);
      expect(result.length).toBe(2); // Should have reloaded all businesses
    });
  });

  describe('getBusinesses', () => {
    it('should return cached businesses if available', async () => {
      (configService as any).cachedConfig = mockBusinesses;

      const result = await configService.getBusinesses();

      expect(result).toEqual(mockBusinesses);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should load config if not cached', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBusinesses,
      } as Response);

      const result = await configService.getBusinesses();

      expect(result).toEqual(mockBusinesses);
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});