import {Dimensions as dim, PixelRatio} from 'react-native';

// Get device dimensions
const DeviceHeight = dim.get('window').height;
const DeviceWidth = dim.get('window').width;
const fontScale = PixelRatio.getFontScale();

export const Dimensions = {
  DeviceHeight,
  DeviceWidth,
  fontScale,
};
