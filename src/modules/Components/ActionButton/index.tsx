import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import brandedConstants from '../../../brandedConstants';
import {fontPixel, heightPixel} from '../../../utils/PixelRatio';
import textStyles from '../../../utils/fonts';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import handleTheme from '../../../helpers/HandleTheme';

const ActionButton = (props: any) => {
  const {
    onPress,
    text,
    buttonStyle,
    buttonTextStyle,
    showLoader,
    isLoading,
    loaderColor,
    loaderStyle,
    loadingText,
    disabled
  } = props;
  const {themeData} = useSelector(state => state?.global);

  const themeColors = handleTheme(themeData);
  const styles = useStyles(themeColors,disabled);
  //   console.log('isLoading', isLoading)
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={buttonStyle || styles.buttonStyle}
      onPress={onPress}
      disabled={disabled ? disabled  : isLoading}>
      {!isLoading && (
        <Text style={buttonTextStyle || styles.buttonTextStyle}>{text}</Text>
      )}
      <View style={styles.loaderContainer}>
        {showLoader && isLoading && (
          <ActivityIndicator
            size="small"
            color={loaderColor || themeColors?.textColorTop}
            style={loaderStyle || styles.loaderStyle}
          />
        )}
        {isLoading && loadingText && (
          <Text style={buttonTextStyle || styles.buttonTextStyle}>
            {loadingText}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const useStyles = (themeColors: any,disabled:boolean) =>
  StyleSheet.create({
    buttonStyle: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors?.buttonColor,
      padding: 5,
      borderRadius: 5,
      width: '100%',
      height: heightPixel(70),
      opacity:disabled ? 0.5 : 1
    },
    buttonTextStyle: {
      color: themeColors?.textColorTop,
      fontSize: fontPixel(18),
      fontWeight: 'bold',
      fontFamily: textStyles.regular.fontFamily,
    },
    loaderStyle: {
      width: heightPercentageToDP('5%'),
      height: heightPercentageToDP('5%'),
      zIndex: 9999,
    },
    loaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // loaderColor: brandedConstants?.Colors.darkTextColor,
    // isLoading:false
  });

export default ActionButton;
