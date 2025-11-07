import React, {Children, ReactNode, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {ParamListBase, Route, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {NativeModules} from 'react-native';
import Config from 'react-native-config';

import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import {Image, ScreenHeight, ScreenWidth} from '@rneui/base';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {showMessage} from 'react-native-flash-message';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {getBrand, getDeviceName} from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';

import {Images} from 'src/constants/Images';
import {useSelector} from 'react-redux';
import {fontPixel, heightPixel, widthPixel} from 'src/utils/PixelRatio';
import {Colors} from 'src/constants/Colors';
import handleTheme from '@helpers/HandleTheme';
import textStyles from '@utils/fonts';
import {Strings} from '@constants/Strings';
import {Constants} from '@constants/Constants';

const AuthWrapper: React.FC<{
  title: string;
  pageNumber: number;
  userDetails: any;
  children: ReactNode;
}> = ({title, children, pageNumber, userDetails}) => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const {themeData, businessDetails} = useSelector(state => state?.global);
  const themeColors = handleTheme(themeData);
  const [screenCount, setScreenCount] = useState(0);

  const styles = useStyle(themeColors);

  const onBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.navigate(Constants.loginRoute);
    }
  };

  useEffect(() => {
    // setScreenCount();
  }, [pageNumber]);

  const jumpTo = (page: number) => {
    if (page >= pageNumber) {
      return;
    }
    switch (page) {
      case 1:
        navigation.navigate(Constants.signupRoute);
        break;
      case 2:
        navigation.navigate(Constants.setPassword, {userDetails: userDetails});
        break;
    }
  };

  useEffect(() => {
    console.log(
      'route?.route?.params?.userDetails',
      JSON.stringify(businessDetails),
    );
  }, [])
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => onBackPress()}>
          <Image source={Images?.backArrow} style={styles.arrowBackIcon} />
        </TouchableOpacity>
        <Text style={styles.loginText}>{title}</Text>
      </View>
      {/* //Breadcrumb */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={styles.breadCrumbContainer}
          activeOpacity={1}
          onPress={() => jumpTo(1)}>
          <Text
            style={[
              styles.countText,
              pageNumber > 0 && {
                color: themeColors?.textColorTop,
                backgroundColor: themeColors?.buttonColor,
              },
            ]}>
            {'1'}
          </Text>

          <Text
            style={[
              styles.screenName,
              ,
              pageNumber > 0 && {color: themeColors?.textColorStrong},
            ]}>
            {Strings.details}
          </Text>
          <Image source={Images.next} style={styles.arrowIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.breadCrumbContainer}
          activeOpacity={1}
          onPress={() => jumpTo(2)}>
          <Text
            style={[
              styles.countText,
              pageNumber > 1 && {
                color: themeColors?.textColorTop,
                backgroundColor: themeColors?.buttonColor,
              },
            ]}>
            {'2'}
          </Text>

          <Text
            style={[
              styles.screenName,
              pageNumber > 1 && {color: themeColors?.textColorStrong},
            ]}>
          { businessDetails?.subdomainData?.allowOnlyOTPLogin == 0 ? Strings.password : Strings.otp}
          </Text>
          {businessDetails?.subdomainData?.isSignupCustomFieldsPresent &&

          <Image source={Images.next} style={styles.arrowIcon} />
}
        </TouchableOpacity>
  {businessDetails?.subdomainData?.isSignupCustomFieldsPresent &&
        <TouchableOpacity
          style={styles.breadCrumbContainer}
          activeOpacity={1}
          onPress={() => jumpTo(3)}>
          <Text
            style={[
              styles.countText,
              pageNumber > 2 && {
                color: themeColors?.textColorTop,
                backgroundColor: themeColors?.buttonColor,
              },
            ]}>
            {'3'}
          </Text>

          <Text
            style={[
              styles.screenName,
              pageNumber > 2
                ? {
                    color: themeColors?.textColorStrong,
                    flexWrap: 'wrap',
                    width: 80,
                  }
                : {flexWrap: 'wrap', width: 80},
            ]}>
            {Strings.additional}
          </Text>
        </TouchableOpacity>
}
      </View>
      <View style={styles.formContainer}>{children}</View>
    </View>
  );
};

const useStyle = (themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors?.backgroundColor,
    },
    arrowBackIcon: {
      width: 22,
      height: 22,
      marginStart: 5,
      tintColor: themeColors?.textColorStrong,
    },
    navigationContainer: {
      flexDirection: 'row',
      marginStart: 10,
      marginTop: 30,

      width: ScreenWidth * 0.9,
    },
    breadCrumbContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginStart: 10,
    },
    countText: {
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: themeColors?.surfaceColorDisabled,
      color: themeColors?.textColorTop,
      textAlign: 'center',
      textAlignVertical: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Platform.OS == 'android' ? 1  : 3,
      fontFamily: textStyles.bold.fontFamily,
      height: 20,
      width: 20,
      fontSize: fontPixel(12),
    },
    screenName: {
      fontFamily: textStyles.bold.fontFamily,
      fontSize: fontPixel(16),
      marginStart: 8,
      color: themeColors?.textColorMedium,
    },

    arrowIcon: {
      height: 20,
      width: 20,
      marginStart: 5,

      resizeMode: 'contain',
      tintColor: themeColors?.textColorMedium,
    },
    formContainer: {
      flex: 1,
      paddingHorizontal: 20,
      marginTop: heightPixel(25),
    },
    loaderStyle: {
      position: 'relative',
      marginTop: heightPercentageToDP('5%'),
    },
    error: {
      color: 'red',
      marginBottom: 5,
    },
    actionBtnContainer: {
      position: 'absolute',
      bottom: heightPixel(30),
      width: ScreenWidth,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    loginButton: {
      backgroundColor: themeColors?.textColorSelected,
      padding: 5,
      borderRadius: 5,
      width: '100%',
      alignItems: 'center',
      height: heightPixel(70),
      justifyContent: 'center',
    },
    buttonText: {
      color: themeColors?.textColorStrong,
      fontSize: fontPixel(18),
      fontWeight: 'bold',
    },
    loginWithOTP: {
      padding: 5,
      borderRadius: 5,
      width: '100%',
      alignItems: 'center',
      height: heightPixel(70),
      justifyContent: 'center',
    },
    forgotPasswordContainer: {
      alignSelf: 'flex-end',
      color: Colors.appSecondaryColor,
      marginEnd: 5,
    },
    selectOptions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 10,
      paddingTop: 8,
      paddingBottom: 8,
      justifyContent: 'flex-start',
      borderRadius: 5,
      width: '80%',
    },
    headerContainer: {
      marginTop: heightPercentageToDP('3%'),
      left: 10,
    },
    loginText: {
      fontSize: fontPixel(35),
      fontWeight: 'bold',
      color: themeColors?.textColorStrong,
      left: 10,
      marginTop: 10,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
      color: themeColors?.textColorStrong,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      backgroundColor: themeColors?.surfaceColor,

      padding: 10,
      marginBottom: 10,
      marginTop: 8,
      width: '100%',
      height: heightPixel(60),
      color: themeColors?.textColorStrong,
    },
  });

export default AuthWrapper;
