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
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Strings} from '@constants/Strings';
import {AsyncValues} from '@constants/AsyncStorage';
import {useDispatch, useSelector} from 'react-redux';
import {loginUser, saveToken, saveUser, userLogOut} from '@redux/actions/user';
import {setServiceStoreURL, setWebViewCookies} from '@redux/actions/global';
import {NativeModules} from 'react-native';
import Config from 'react-native-config';
import {fontPixel, heightPixel, widthPixel} from '@utils/PixelRatio';
import Api, {setToken} from '@services/Api';
import {urls} from '@constants/Url';
import ChooseStore from '@modules/Components/ChooseStore';
import {TouchableRipple} from 'react-native-paper';
import {Image} from 'react-native';
import {Colors} from '@constants/Colors';
import textStyles from '@utils/fonts';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import FullScreenSpinner from '@modules/Components/ChooseStore';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {showMessage} from 'react-native-flash-message';
import {Constants} from '@constants/Constants';
import {
  fetchCustomFieldsApi,
  preLoginCheckApi,
  registerUserApi,
  sendOTPApi,
} from '@services/Api/Auth';
import {getCookieArrayFromHeader} from '@helpers/Cookies';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {getBrand, getDeviceName} from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import ActionButton from '@modules/Components/ActionButton';
import handleTheme from '@helpers/HandleTheme';
import Toastable, {showToastable} from 'react-native-toastable';
import PhoneNumberInput from '@modules/Components/PhoneNumberInput';
import AuthWrapper from '@modules/Auth/Signup/Components/AuthWrapper';
import PasswordInput from '@modules/Components/Passwordinput';
import brandedConstants from '@brandedConstants/index';
import {shortSuccessFlashMessage} from '@utils/flashMessage';

interface FormValues {
  password: String;
  confirmPassword: String;
  otp: String;
}

const validationSchemaWithPass = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be minimum 8 characters long')
    .required('Please enter a password'),
  confirmPassword: Yup.string()
    .min(8, 'Password must be minimum 8 characters long')
    .required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
});
const validationSchemaWithOTP = Yup.object().shape({
  otp: Yup.string().required('Please enter OTP'),
});

const SetPassword: React.FC = (route: any) => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const {themeData, businessDetails,serviceStoreURL} = useSelector((state:any) => state?.global);
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [OTPLogin, setOTPLogin] = useState(false);
  const [otp, setOTP] = useState('');
  const [validationSchema, setValidationSchema] = useState<any>(
    validationSchemaWithPass,
  );

  const themeColors = handleTheme(themeData);
  const styles = useStyle(themeColors);

  const handleSubmit = (values: FormValues) => {
    console.log('values', values);
    if (values) {
      fetchCustomFields(values);
    }
  };

  const fetchCustomFields = (values: any) => {
    setLoading(true);
    try {
      fetchCustomFieldsApi(businessDetails?.business_id).then(
        (response: any) => {
          console.log('fetchCustomFields:', response);
          let result = JSON.stringify(response);
          setLoading(false);
          // alert('error' + token);
          if (response.error) {
            console.log('fetchCustomFields error', response);
          } else {
            if (response?.data) {
              console.log('fetchCustomFields', response?.data);
              if (response?.data?.length > 0) {
                navigation.navigate(Constants.customFields, {
                  userDetails: route?.route?.params?.userDetails,
                  password: OTPLogin ? values?.otp : values?.password,
                  OTPLogin,
                });
              } else {
                registerUser(
                  route?.route?.params?.userDetails,
                  OTPLogin ? values?.otp : values?.password,
                );
              }
            }
          }
        },
      );
    } catch (error) {
      console.log('forgotPasswordApi error', error);
      setLoading(false);
    }
  };

  const registerUser = (userDetails: any, password: any) => {
    try {
      setLoading(true);
      let data: any = {
        email: userDetails?.email,
        firstname: userDetails.firstName,
        lastname: userDetails.lastName,
        phonenumber: userDetails.phoneNumber,

        custom_fields: {},
        sendEmail: 0,
        business_id: businessDetails?.business_id,
      };

      if (OTPLogin) {
        data.otp = password;
      } else {
        data.password = password;
        data.cnfPassword = password;
      }

      console.log('data', data);

      registerUserApi(data).then((response: any) => {
        console.log('registerUser response :', response);
        let result = JSON.stringify(response);
        setLoading(false);
        // alert('error' + token);
        if (response.error) {
          console.log('registerUser error', response);
          showMessage({
            message: Strings?.somethingWentWrong,
            type: 'danger',
            icon: 'danger',
            floating: true,
            duration: 1500,
          });
        } else {
          if (response.success) {
            showMessage(
              shortSuccessFlashMessage(themeColors, Strings?.accountCreated),
            );
            dispatch(
              loginUser({
                storeURL:serviceStoreURL,
                email: userDetails?.email,
                password: password,
                businessId: businessDetails?.business_id,
                type: OTPLogin ? 'otp' : 'email',
                multiLocation:businessDetails?.subdomainData?.isMultiLocationBusiness

              }),
            );
            // fetchCsrfToken(password);
          }
        }
      });
    } catch (error) {
      console.log('registerUser error', error);
      setLoading(false);

      showMessage({
        message: Strings?.somethingWentWrong,
        type: 'danger',
        icon: 'danger',
        floating: true,
        duration: 1500,
      });
    }
  };
  const sendCode = (email: string) => {
    try {
      let data = {
        email: email,
        business_id: businessDetails?.business_id,
      };
      console.log('data', data);

      sendOTPApi(data).then((response: any) => {
        console.log('sendCode response :', response);
        let result = JSON.stringify(response);
        setLoading(false);
        // alert('error' + token);
        if (response.error) {
          console.log('sendCode error', response);
          showMessage({
            message: Strings?.somethingWentWrong,
            type: 'danger',
            icon: 'danger',
            floating: true,
            duration: 1500,
          });
        } else {
          if (response.success) {
            showMessage(
              shortSuccessFlashMessage(themeColors, 'One-time Passcode Sent'),
            );
          }
        }
      });
    } catch (error) {
      console.log('sendCode error', error);
      showMessage({
        message: Strings?.somethingWentWrong,
        type: 'danger',
        icon: 'danger',
        floating: true,
        duration: 1500,
      });
    }
  };

  useEffect(() => {
    console.log(
      'route?.route?.params?.userDetails',
      businessDetails?.subdomainData.allowOnlyOTPLogin,
    );
    const OTPLogin = businessDetails?.subdomainData?.allowOnlyOTPLogin == 1;
    if (OTPLogin) {
      sendCode(route?.route?.params?.userDetails?.email);
    }
    setOTPLogin(OTPLogin);
    setValidationSchema(
      OTPLogin ? validationSchemaWithOTP : validationSchemaWithPass,
    );
  }, [route]);

  return (
    <AuthWrapper
      title={'Create Account'}
      pageNumber={2}
      userDetails={route?.route?.params?.userDetails}>
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
          otp: '',
        }}
        validationSchema={validationSchema}
        onSubmit={values => handleSubmit(values)}>
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
              enableOnAndroid={true}
              keyboardShouldPersistTaps={'handled'}
              style={{flex: 1}}>
              {OTPLogin ? (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>OTP</Text>
                  {/* Added OTP label */}
                  <TextInput
                    placeholder="Enter OTP"
                    placeholderTextColor={themeColors?.textColorMedium}
                    onChangeText={handleChange('otp')}
                    onBlur={handleBlur('otp')}
                    value={values.otp}
                    style={styles.input}
                    returnKeyType={'done'}
                    keyboardType={'number-pad'}
                  />
                  {touched.otp && errors.otp && (
                    <Text style={styles.error}>{errors.otp}</Text>
                  )}
                </View>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{'Password*'}</Text>
                    {/* Added email label */}
                    <PasswordInput
                      placeholder="Enter your password"
                      placeholderTextColor={themeColors?.textColorMedium}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      themeColors={themeColors}
                      containerStyle={styles.input}
                      IconColor={themeColors?.textColorMedium}
                      returnKeyType={'done'}
                    />
                    {touched?.password && errors?.password && (
                      <Text style={styles.error}>{errors?.password}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{'Confirm Password*'}</Text>
                    {/* Added email label */}

                    <PasswordInput
                      placeholder="Reenter Password"
                      placeholderTextColor={themeColors?.textColorMedium}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values?.confirmPassword}
                      themeColors={themeColors}
                      containerStyle={styles.input}
                      IconColor={themeColors?.textColorMedium}
                      returnKeyType={'done'}
                    />
                    {touched?.confirmPassword && errors?.confirmPassword && (
                      <Text style={styles.error}>
                        {errors?.confirmPassword}
                      </Text>
                    )}
                  </View>
                </>
              )}
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
      borderColor: themeColors?.textColorMedium,
      borderRadius: 5,
      backgroundColor: themeColors?.surfaceColor,

      paddingHorizontal: 10,
      marginBottom: 10,
      marginTop: 8,
      paddingVertical: 0,
      width: '100%',
      height: heightPixel(70),
      color: themeColors?.textColorStrong,
    },
    inputContainer: {
      marginTop: heightPixel(20),
    },
  });

export default SetPassword;
