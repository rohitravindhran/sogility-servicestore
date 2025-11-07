import {StyleSheet} from 'react-native';
import { Dimensions } from '@utils/Dimensions';
import textStyles from '@utils/fonts';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import { fontPixel, heightPixel, widthPixel } from '@utils/PixelRatio';
import { Colors } from '@constants/Colors';
import { ThemeColors } from 'src/types/themeType';

const width = Dimensions.DeviceWidth;
const height = Dimensions.DeviceHeight;

const getStyles = (themeColors:ThemeColors) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      height: height,
      backgroundColor: themeColors?.backgroundColor,
    },
    image: {
      tintColor: themeColors?.buttonColor,
      fontSize: widthPercentageToDP('30%'),
    },
    text: {
      color: themeColors?.textColorStrong,
      fontFamily: textStyles.medium.fontFamily,
      fontSize: fontPixel(16),
      width: width * 0.8,
      textAlign: 'center',
      alignSelf: 'center',
    },
    buttonTxt: {
      color: themeColors?.textColorTop,
      fontFamily: textStyles.bold.fontFamily,
      marginTop: 10,
    },

    backGroundImage: {
      height: '100%',
      width: '100%',
    },
    innerContainer: {
      flex: 1,
    },
    appLogoContainer: {
      height: '17%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      height:widthPixel(220),
      width: widthPixel(220),
      resizeMode:'contain',
      marginTop:heightPixel(50)
    },
    offlineImageContainer: {
      height: '47%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    offlineImage: {height: '95%', width: '60%',
  tintColor:themeColors?.buttonColor
},
    offlineTextContainer: {
      height: '20%',
      alignItems: 'center',
    },
    offlineHeadingText: {
      height: '30%',
      width: '70%',
      justifyContent: 'center',
    },
    offlineDescText: {
      height: '30%',
      width: '65%',
      justifyContent: 'center',
    },
    offlineTextHeading: {
      color: themeColors?.textColorStrong,
      fontSize: 20,
      textAlign: 'center',
      fontFamily: textStyles.bold.fontFamily,
    },
    offlineTextDesc: {
      color: themeColors?.textColorMedium,
      fontSize: fontPixel(18),
      textAlign: 'center',
      alignSelf: 'center',
      fontFamily: textStyles.regular.fontFamily,
    },
    offlineButtonContainer: {
      height: '5%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    offlineButton: {
      borderRadius: 8,
    },
    btnContainer: {width: '90%', height: 65},
  });

export default getStyles;
