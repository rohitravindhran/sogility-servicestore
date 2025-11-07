//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {heightPercentageToDP} from 'react-native-responsive-screen';
import {Colors} from '../../../../../constants/Colors';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import { heightPixel } from '../../../../../utils/PixelRatio';

// define your styles
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    width: ScreenWidth,
    height: ScreenHeight,
    bottom: 0,
    marginBottom:heightPixel(85),
    flex:1,
    position: 'absolute',
    backgroundColor:'#fff',
   
  },

  loaderAnimationStyle: {
    width: heightPercentageToDP('15%'),
    height: heightPercentageToDP('15%'),
    position: 'absolute',
    zIndex: 9999,
  },
  
});

export default styles;
