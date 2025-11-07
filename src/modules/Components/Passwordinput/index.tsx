import React, {Component, useState} from 'react';
import {Image, TextInput} from 'react-native';
import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {Images} from '../../../constants/Images';
import {heightPixel} from '../../../utils/PixelRatio';
import brandedConstants from '../../../brandedConstants';
import {Colors} from '../../../brandedConstants/lumina/Colors';
import textStyles from '@utils/fonts';

const PasswordInput = (props: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const styles = useStyle(props?.themeColors);
  return (
    <View style={[styles.container, props?.containerStyle]}>
      <TextInput
        secureTextEntry={!showPassword}
        {...props}
        style={[styles.textInputStyle, props.textStyles]}
        underlineColorAndroid='transparent'
      />

      <TouchableWithoutFeedback onPress={() => setShowPassword(!showPassword)}>
        <Image
          source={showPassword ? Images?.openEye : Images?.closeEye}
          style={{
            width: 22,
            height: 22,
            resizeMode: 'contain',
            zIndex: 999999,
            tintColor: props?.themeColors?.textColorMedium,
          }}
        />
      </TouchableWithoutFeedback>
    </View>
  );
};

const useStyle = (themeColors: any) =>
  StyleSheet.create({
    container: {
      justifyContent: 'space-between',
      alignItems: 'center',
      
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,

      padding: 10,
      marginBottom: 10,
      marginTop: 5,
      width: '100%',
      height: heightPixel(70),
      flexDirection: 'row',
    },
    textInputStyle: {
      width: '90%',
      height: '100%',
alignSelf:'center',
textAlignVertical:'center',
      color: themeColors?.textColorStrong,
      fontFamily:textStyles.regular.fontFamily,
      textDecorationLine:'none'
    },
  });

export default PasswordInput;
