import React, {useEffect, useState} from 'react';
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
import {Strings} from '../../../constants/Strings';
import {AsyncValues} from '../../../constants/AsyncStorage';
import {useDispatch, useSelector} from 'react-redux';
import {saveToken, saveUser, userLogOut} from '../../../redux/actions/user';
import {
  setServiceStoreURL,
  setWebViewCookies,
} from '../../../redux/actions/global';
import {NativeModules} from 'react-native';
import Config from 'react-native-config';
import {fontPixel, heightPixel, widthPixel} from '../../../utils/PixelRatio';
import config from '../../../../env.config';
import Api, {setToken} from '../../../services/Api';
import {urls} from '../../../constants/Url';
import ChooseStore from '../../Components/ChooseStore';
import {TouchableRipple} from 'react-native-paper';
import {Image} from 'react-native';
import {Colors} from '../../../constants/Colors';
import textStyles from '../../../utils/fonts';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import FullScreenSpinner from '../../Components/FullScreenSpinner';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {showMessage} from 'react-native-flash-message';
import {Constants} from '../../../constants/Constants';
import {preLoginCheckApi} from '../../../services/Api/Auth';
import {getCookieArrayFromHeader} from '../../../helpers/Cookies';
import brandedConstants from '../../../brandedConstants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {getBrand, getDeviceName} from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import ActionButton from '../../Components/ActionButton';
import handleTheme from '../../../helpers/HandleTheme';
import Toastable, {showToastable} from 'react-native-toastable';
import AuthWrapper from './Components/AuthWrapper';
import PhoneNumberInput from '@modules/Components/PhoneNumberInput';
import PhoneNumber from 'libphonenumber-js';
import {phoneSchema} from '../../../utils/validations';

interface FormValues {
  firstName: String;
  lastName: String;
  email: String;
  phoneNumber: String;
}

const Signup: React.FC = (route: any) => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const {themeData, businessDetails} = useSelector(state => state?.global);
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState(false);

  const [loginError, setLoginError] = useState(false);

  const themeColors = handleTheme(themeData);
  const styles = useStyle(themeColors);
  const [countryCallingCode, setCountryCallingCode] = useState('');
  const [countryCode, setCountryCode] = useState('');

  const handleSignup = (values: FormValues) => {
    // Handle login logic here
    setLoginError(false);
    const userDetails = {
      ...values,
      phoneNumber: countryCallingCode + values.phoneNumber,
    };
    console.log('Login data:', userDetails);
    if (userDetails) {
      navigation.navigate('setPassword', {userDetails: userDetails});
    }
  };

  return (
    <AuthWrapper title={'Create Account'} pageNumber={1} userDetails={''}>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: route?.route?.params?.email || '',
          phoneNumber: '',
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string().required('Please enter your first name'),
          lastName: Yup.string()
            .min(3, 'Lastname should contain minimum 3 characters atleast')
            .required('Please enter your last name'),
          email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
          phoneNumber: phoneSchema(countryCode).required(
            'Please enter your phone number',
          ),
        })}
        onSubmit={values => handleSignup(values)}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps={'always'}
              enableOnAndroid={true}
              style={{flex: 1}}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{'First Name*'}</Text>
                {/* Added email label */}
                <TextInput
                  placeholder="Enter your first name"
                  placeholderTextColor={themeColors?.textColorMedium}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  value={values.firstName}
                  style={styles.input}
                  returnKeyType="done"
                />
                {touched?.firstName && errors?.firstName && (
                  <Text style={styles.error}>{errors?.firstName}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{'Last Name*'}</Text>
                {/* Added email label */}
                <TextInput
                  placeholder="Enter your last name"
                  placeholderTextColor={themeColors?.textColorMedium}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  value={values.lastName}
                  style={styles.input}
                  returnKeyType="done"
                />
                {touched?.lastName && errors?.lastName && (
                  <Text style={styles.error}>{errors?.lastName}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{'Email Address*'}</Text>
                {/* Added email label */}
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={themeColors?.textColorMedium}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  style={styles.input}
                  returnKeyType="done"
                  editable={false}
                />
                {/* {touched?.email && errors?.email && (
                  <Text style={styles.error}>{errors?.email}</Text>
                )} */}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{'Phone*'}</Text>

                {/* Added email label */}

                <PhoneNumberInput
                  placeholder="Enter your Phone number"
                  placeholderTextColor={themeColors?.textColorMedium}
                  onChangeText={handleChange('phoneNumber')}
                  onChangeCountryCode={(country: any) => {
                    setCountryCallingCode(country?.callingCode[0]),
                      setCountryCode(country?.cca2);
                  }}
                  onBlur={handleBlur('phoneNumber')}
                  value={values.phoneNumber}
                  // style={styles.input}
                  textInputStyle={styles.input}
                  onChangeNumber={handleChange('phoneNumber')}
                  themeColors={themeColors}
                />

                {touched?.phoneNumber && errors?.phoneNumber && (
                  <Text style={styles.error}>{errors?.phoneNumber}</Text>
                )}
              </View>
            </KeyboardAwareScrollView>
            <View style={[styles.actionBtnContainer]}>
              <ActionButton
                text={'Continue'}
                showLoader={true}
                isLoading={isLoading}
                onPress={handleSubmit}
              />
            </View>
          </>
        )}
      </Formik>
    </AuthWrapper>
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

    formContainer: {
      flex: 1,
      paddingVertical: 20,
      paddingHorizontal: 20,
      marginTop: heightPixel(50),
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
      paddingBottom: heightPixel(25),
      paddingTop: heightPixel(10),
      bottom: 0,
      width: ScreenWidth,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: themeColors?.backgroundColor,
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
      fontSize: fontPixel(15),
      padding: 10,
      marginBottom: 10,
      marginTop: 8,
      width: '100%',
      height: heightPixel(60),
      color: themeColors?.textColorStrong,
    },
    inputContainer: {
      marginTop: heightPixel(20),
    },
  });

export default Signup;
