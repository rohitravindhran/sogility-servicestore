import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock expo-asset
const mockAsset = {
  localUri: 'mock://local-uri',
  downloadAsync: jest.fn().mockResolvedValue(undefined),
};

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => mockAsset),
    fromURI: jest.fn(() => mockAsset),
  },
}));

global.mockAsset = mockAsset;

// Mock expo-linking
jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn(),
  addEventListener: jest.fn(),
  parse: jest.fn(),
  openURL: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock fetch
global.fetch = jest.fn();

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');