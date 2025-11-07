//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {Colors} from '../../../constants/Colors';
import styles from './style';

// create a component
const FullScreenSpinner = (props: {
  isLoading: boolean;
  transparent: boolean;
  loaderStyle: any;
  color: any;
}) => {

  const {isLoading, transparent, loaderStyle, color} = props;
  return (
    <>
      {isLoading && (
        <View
          style={[
            styles.container,
            transparent
              ? {backgroundColor: Colors.blackGradient}
              : {backgroundColor: Colors.white},
          ]}>
          <ActivityIndicator
            size="large"
            color={color}
            style={[styles.loaderAnimationStyle, loaderStyle && loaderStyle]}
          />
        </View>
      )}
    </>
  );
};

export default FullScreenSpinner;
