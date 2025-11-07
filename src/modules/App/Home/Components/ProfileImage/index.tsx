import React, {Component, useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet,Platform} from 'react-native';
import textStyles from '@utils/fonts';
import {useTheme} from '@react-navigation/native';
import { Strings } from '@constants/Strings';
import { ScreenWidth } from '@rneui/base';
import { Dimensions } from '@utils/Dimensions';
import { Constants } from '@constants/Constants';
import { Images } from '@constants/Images';

const ProfileImage = (props:any )=> {
  const {source, firstName, lastName, style, textStyle} = props;
  const {colors} = useTheme();
  const styles = getStyles(colors);
  const [imageError, setImageError] = useState(false);

  let Name = firstName?.length > 0;

  useEffect(() => {
    source && setImageError(false);
  }, [source]);

  return (
    <View style={styles.container}>
      {source != null &&
      source != '' &&
      source != Constants?.dummyImageURL &&
      !imageError ? (
        <View style={styles.monogramContainer}>
          <Image
            source={{uri: source}}
            style={[styles.image, style]}
            onError={error => {
              setImageError(true);
            }}
          />
        </View>
      ) : firstName?.length > 0 ? (
        <View style={[styles.monogram, style]}>
          <Text style={[styles.nameTxt, textStyle]} numberOfLines={1}>
          </Text>
        </View>
      ) : (
        <View style={styles.imageContainer}>

        <Image source={Images.profile} style={styles.profile} />
        </View>
      )}
    </View>
  );
};

ProfileImage.defaultProps = {
  style: {},
  textStyle: {},
};


const getStyles = (colors:any) =>
  StyleSheet.create({
    container: {},
    image: {borderWidth: 1, borderColor: colors.profileImageBorder,
   
        
    },
    imageContainer:{
backgroundColor:'#d3d3d3',
borderRadius:20,
padding:8,
marginEnd:10
    },
    monogramContainer:{
    },
    monogram: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.profileEmptyStateColor,
      borderRadius: 999,
      paddingTop: Platform.OS == 'android ' ? 2 : 0,
    },
    profile: {
      width: 20,
      height: 20,
      resizeMode: 'cover',
      borderRadius: 25 / 2,
      alignItems: 'center',
 
    },
    nameTxt: {
      color: colors.placeholderColor,
      fontSize: ScreenWidth * 0.05,
      alignSelf: 'center',
      letterSpacing: 1,
      textAlign: 'center',
      textAlignVertical: 'center',
      overflow: 'hidden',
      marginTop: Platform.OS == 'android ' ? 10 : 0,
      justifyContent: 'center',
      // borderWidth: 1,
      fontFamily: textStyles.regular.fontFamily,
      borderRadius: 25 / 2,
      fontWeight: '500',
      backgroundColor: colors.profileEmptyStateColor,
    },
  });

export default ProfileImage;
