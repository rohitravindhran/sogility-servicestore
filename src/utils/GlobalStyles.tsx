import {heightPercentageToDP} from 'react-native-responsive-screen';
import {Colors} from '../constants/Colors';
import { StyleSheet, Platform } from 'react-native';
import { heightPixel } from '@utils/PixelRatio';
import textStyles from '@utils/fonts';

export const GlobalStyles = (themeColors: any) =>
  StyleSheet.create({
    flashMessage: {
    backgroundColor: themeColors?.buttonColor,
    height:Platform.OS == 'android' ? 60: 100,
    fontFamily:textStyles.regular.fontFamily,
    justifyContent:'center',
    alignItems:'center'
  },
  });
