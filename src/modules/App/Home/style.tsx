
import CookieManager from '@react-native-cookies/cookies';
import { useNavigation } from '@react-navigation/native';
import React, { Component, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dimensions } from '../../../utils/Dimensions';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { Colors } from '../../../constants/Colors';
import textStyles from '../../../utils/fonts';
import { fontPixel } from '../../../utils/PixelRatio';

const useStyle = (width:number,height:number,themeColors:any) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:themeColors ?  themeColors?.backgroundColor   :Colors.backgroundThemeColor,
      

    },
    webview:{
        width:Dimensions.DeviceWidth,
        flex:1,
   
    }
    ,
    loaderAnimationStyle: {
        width: heightPercentageToDP('11.26%'),
        height: heightPercentageToDP('11.26%'),
      },
      activityContainer: {
        backgroundColor: Colors?.backgroundThemeColor,
        height: height * 0.88,
        width: width,
      },
      errorContainer: {

      },
      errorText: {
        color: themeColors?.textColorMedium,
        fontFamily: textStyles.regular.fontFamily,
        width: widthPercentageToDP('80%'),
        fontSize: fontPixel(18),
        textAlign: 'center',
      },
      btnContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      retryBtn: {
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: Colors.white,
        padding: 8,
        width: widthPercentageToDP('25%'),
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themeColors?.textColorSelected,
      },
      retryBtnTxt: {
        fontFamily: textStyles.regular.fontFamily,
    color: Colors.white,
      },
});


export default useStyle;


