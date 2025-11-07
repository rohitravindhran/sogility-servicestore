import React, {Component, useEffect, useState} from 'react';
import {Image, TextInput, TouchableOpacity} from 'react-native';
import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {Images} from '../../../constants/Images';
import {fontPixel, heightPixel} from '../../../utils/PixelRatio';
import brandedConstants from '../../../brandedConstants';
import {Colors} from '../../../brandedConstants/lumina/Colors';
import CountryPicker, {
  Country,
  CountryCode,
   DARK_THEME 
} from 'react-native-country-picker-modal';
import * as RNLocalize from 'react-native-localize';


const PhoneNumberInput = (props: any) => {
  const [countryCode, setCountryCode] = useState<any>('');
  const [country, setCountry] = useState<Country>({
    region: 'Asia', // Replace with the actual region
    subregion: 'Southern Asia', // Replace with the actual subregion
    currency: ['INR'], // Replace with the actual currency code(s)
    callingCode: ['+91'], // Replace with the actual calling code(s)
    flag: '🇮🇳', // Replace with the actual flag
    name: 'India', // Replace with the actual name or translation
    cca2: 'IN', // Replace with the actual country code
  });

  const [showCountryCodeSelector, setShowCountryCodeSelector] = useState(false);
  const [withCountryNameButton, setWithCountryNameButton] =
    useState<boolean>(false);
  const [withFlag, setWithFlag] = useState<boolean>(true);
  const [withEmoji, setWithEmoji] = useState<boolean>(true);
  const [withFilter, setWithFilter] = useState<boolean>(true);
  const [withAlphaFilter, setWithAlphaFilter] = useState<boolean>(true);
  const [withCallingCode, setWithCallingCode] = useState<boolean>(true);
  const [withCallingCodeButton, setWithCallingCodeButton] = useState<boolean>(true);

  const onSelect = (country: Country) => {
    let countdredetails = JSON.stringify(country);
    console.log('countdredetails', countdredetails);
    setCountry(country);
    setCountryCode(country?.cca2);

  };

  const changeNumber = (text: string) => {
    console.log('countryCode');
    props.onChangeText(text);

  };
  useEffect(() => {
  // Get the user's country code
      const countryCode = RNLocalize?.getCountry();
      setCountryCode(countryCode);

  }, [])
  
  useEffect(() => {
    props.onChangeCountryCode(country);

  
    }, [country])

  const styles = useStyle(props?.themeColors);
  return (
    <View style={[styles.container, props?.containerStyle]}>
        <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowCountryCodeSelector(true)}
        style={styles.countryCodeStyle}
        >
      <CountryPicker
        {...{
          countryCode,
          withFilter,
          withCountryNameButton,
          withAlphaFilter,
          withCallingCode,
          withEmoji,
          onSelect,
        }}
        theme={props?.themeColors?.isDarkTheme && DARK_THEME  }
        visible={showCountryCodeSelector}
        onClose={() => setShowCountryCodeSelector(false)}
      />
    
        <Text
          style={{color: props?.themeColors?.textColorStrong, marginEnd: 10,fontSize:fontPixel(15),
          }}>
          {country?.cca2 + ' ( ' + (country?.callingCode[0] || '') + ')   |'}
        </Text>
      </TouchableOpacity>
      <TextInput
        {...props}
        onChangeText={text => changeNumber(text)}
        keyboardType={'phone-pad'}
        returnKeyType={'done'}
        phoneNumberValue={props?.phoneNumberValue}
        style={[styles.textInputStyle, props.textStyles]}
      />
    </View>
  );
};

const useStyle = (themeColors: any) =>
  StyleSheet.create({
    container: {
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors?.textColorMedium,
      borderRadius: 5,

      padding: 10,
      marginBottom: 10,
      marginTop: 5,
      width: '100%',

      height: heightPixel(70),
      flexDirection: 'row',
    },
    textInputStyle: {
      width: '80%',
      fontSize:fontPixel(15),

      color: themeColors?.textColorStrong,
    },
    countryCodeStyle:{
      flexDirection:'row',
      alignItems:'center'
    }
  });

export default PhoneNumberInput;
