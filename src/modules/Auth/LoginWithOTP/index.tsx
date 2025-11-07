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
import {Strings} from '../../../constants/Strings';
import {AsyncValues} from '../../../constants/AsyncStorage';
import {useDispatch, useSelector} from 'react-redux';
import {
  loginUser,
  saveToken,
  saveUser,
  userLogOut,
} from '../../../redux/actions/user';
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
import FullScreenSpinner from '../../App/Home/Components/FullScreenSpinner';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {showMessage} from 'react-native-flash-message';
import {Constants} from '../../../constants/Constants';
import {
  forgotPasswordApi,
  preLoginCheckApi,
  sendOTPApi,
  verifyOTPApi,
} from '../../../services/Api/Auth';
import {getCookieArrayFromHeader} from '../../../helpers/Cookies';
import brandedConstants from '../../../brandedConstants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import handleTheme from '../../../helpers/HandleTheme';
import ActionButton from '../../Components/ActionButton';
import DigitCodeInput from '../../Components/DigitCodeInput';
import messaging from '@react-native-firebase/messaging';
import {getBrand} from 'react-native-device-info';
import axios from 'axios';
import Toastable, {showToastable} from 'react-native-toastable';
import {setLoading as setGlobalLoading} from '../../../redux/actions/global';
import {shortSuccessFlashMessage} from '@utils/flashMessage';

interface FormValues {
  digitCode: string;
}
const validationSchemaDigitCode = Yup.object().shape({
  digitCode: Yup.string().required('Please enter 4-digit code'),
});

const LoginWithOTP: React.FC = (route: any) => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const {themeData, businessDetails} = useSelector(state => state?.global);
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState(route?.route?.params?.email);
  const [password, setPassword] = useState('');
  const [userID, setUserID] = useState('');

  const [isUser, setIsUser] = useState(false);
  const [loginError, setLoginError] = useState<String>('');
  const [userNotFound, setUserNotFound] = useState(false);

  const [otpSent, setOTPSent] = useState(false);
  const [storeURL, setStoreURL] = useState(Constants?.storeURL);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [businesses, setBusinesses] = useState<any>([]);

  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [cookies, setCookies] = useState<any>('');
  const [response, setResponse] = useState<any>('');

  const themeColors = handleTheme(themeData);
  const styles = useStyle(themeColors);

  const onBackPress = () => {
    navigation.goBack();
  };

  const handleLogin = (values: FormValues) => {
    setLoginError('');
    console.log('values', values);
    fetchCsrfToken('', values?.digitCode, true);
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
            showMessage(shortSuccessFlashMessage(themeColors, 'One-time Passcode Sent'));
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

  // const verifyOTP = (email: string,code:string) => {
  //   console.log('businessDetails?.business_url', brandedConstants?.Constants?.storeURL);
  //   try {
  //     let data = {
  //       businessURL:Constants?.storeURL,
  //       email: email,
  // 			code:code
  //     };
  //     console.log('data', data);

  //     verifyOTPApi(data).then((response: any) => {
  //       console.log('sendCode response :', response);
  //       let result = JSON.stringify(response);

  //         // Get the "Set-Cookie" header from the response
  //         const setCookieHeader = response.headers.get('Set-Cookie');

  //         if (setCookieHeader) {
  //           const {cookieObjects, sessionTokenExists, omnifyToken} =
  //             getCookieArrayFromHeader(setCookieHeader, storeURL);

  //           if (sessionTokenExists) {
  //             redirectToHome(cookieObjects, omnifyToken?.replace('; expires',''));
  //             // console.log('cookie found');
  //           } else {
  //             setLoginError(true);
  //           }
  //         }

  //       setLoading(false);
  //       // alert('error' + token);
  //       // if (response.error) {
  //       //   console.log('sendCode error', response);
  //       // } else {
  //       //   if (response.success == 1) {
  //       //     alert(response.message);
  //       //   }else{
  //       //     setLoginError(response.message);
  //       //   }
  //       // }
  //     });
  //   } catch (error) {
  //     console.log('sendCode error', error);
  //   }
  // };


  const fetchCsrfToken = (password: string, otp: string, otpLogin: boolean) => {
    setLoading(true);
    console.log('csrf', `${storeURL}/api/auth/csrf`);
    fetch(`${storeURL}/api/auth/csrf`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Referer: `${storeURL}/home?b=t`,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'sec-ch-ua':
          '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // If the response is JSON
        // If the response is not JSON, you can use response.text() or other appropriate methods
      })
      .then(data => {
        console.log('Response data:', data);
        fetchCookies(data?.csrfToken, password, otp, otpLogin);
        setLoading(false);

        // Handle the response data as needed
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);

        // Handle errors
      });
  };
  const fetchCookies = async (
    csrf: string,
    password: string,
    otp: string,
    otpLogin: boolean,
  ) => {
    setLoading(true);

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    myHeaders.append('Referrer-Policy', 'strict-origin-when-cross-origin');
    myHeaders.append(
      'User-Agent',
      `${`Service-Store-App-${await messaging().getToken()}`}`,
    );
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Add any other headers if required
    };
    const formData = new URLSearchParams();
    formData.append('redirect', 'false');
    formData.append('email', email);
    formData.append('password', otp);
    formData.append('type', 'otp');
    formData.append('csrfToken', csrf);
    formData.append('callbackUrl', 'https://luminademo.getomnify.com/home?b=t');
    formData.append('json', 'true');

    var requestOptions = {
      method: 'POST',
      headers,

      body: formData.toString(), // Convert the form data to a string
    };
    let apiURl = `${storeURL}/api/auth/callback/credentials?`;

    console.log('requestOptions', requestOptions);
    console.log('apiURl', apiURl);

    fetch(apiURl, requestOptions)
      .then(response => {
        // if (!response.ok) {
        //   throw new Error('Network response was not ok');
        // }

        console.log('response', response);
        // Get the "Set-Cookie" header from the response
        const setCookieHeader = response.headers.get('Set-Cookie');
        console.log('response.headers', response);
        console.log('setCookieHeader', setCookieHeader);
        if (setCookieHeader) {
          getCookieArrayFromHeader(setCookieHeader, storeURL);

          const {cookieObjects, sessionTokenExists, omnifyToken} =
            getCookieArrayFromHeader(setCookieHeader, storeURL);

          if (sessionTokenExists) {
            setLoading(true);
            showMessage(shortSuccessFlashMessage(themeColors, 'Logging in'));

            setTimeout(() => {
              redirectToHome(
                cookieObjects,
                omnifyToken?.replace('; expires', ''),
              );
            }, 1000);
            // console.log('cookie found');
          } else {
            setLoginError('Invalid OTP');

          }
        }
        return response.json();
      })
      .then(data => {
        console.log('API Response:', data);
      })
      .catch(error => {
        setLoading(false);
        setLoginError('Invalid OTP');
      });
  };
  const sendFCMTokenToServer = async (token: string) => {
    if (!token) {
      console.log('token not available');
      return;
    }
    console.log(
      'urls',
      `${urls.business + selectedBusiness?.business_id + urls.sendDeviceToken}`,
    );
    setLoading(true);

    // console.log('getDeviceName', getBrand())
    var raw = {
      token: await messaging().getToken(),
      device_type: Platform.OS,
      device_details: getBrand(),
      screen_resolution: `${ScreenWidth}x${ScreenHeight}`,
    };

    let apiURl = `${
      urls.business + selectedBusiness?.business_id + urls.sendDeviceToken
    }`;

    // console.log('requestOptions', raw);
    // console.log('apiURl', apiURl);
    // console.log('raw', token);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.post(apiURl, raw, config);
      // console.log('Response:', response.data);

      let result = JSON.stringify(response);
      // console.log('send fcm token response', response);

      // alert('error' + token);
      if (response?.data?.error) {
        console.log('send fcm token response error', response?.data?.error);
        setLoading(false);
      } else {
        console.log('fcm token send successfully');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const redirectToHome = (cookies: any, token: string) => {
    let cookiesJSON = JSON.stringify(cookies);
    sendFCMTokenToServer(token);

    dispatch(saveToken(token));

    dispatch(
      saveUser({
        email: email,
        storeURL: storeURL,
      }),
    );

    dispatch(setServiceStoreURL(storeURL));

    dispatch(setWebViewCookies(cookiesJSON));

    dispatch(setGlobalLoading(true));
    console.log('API Response: cookies', cookiesJSON, storeURL);

    setTimeout(() => {
      navigation.reset({
        routes: [
          {
            name: Constants?.homeRoute,
            params: {
              serviceStoreURL: storeURL,
            },
          },
        ],
      });
    }, 200);
  };

  const preLoginCheck = (email: string, businessId: string) => {
    if (!email || !businessId) {
      console.log('email or bid is null');
      return;
    }
    console.log(
      'urls',
      `${urls.getInfoForLogin}&email=${email}&business_id=${businessId}`,
    );
    setLoading(true);
    try {
      Api.getAuthInstance(
        `${urls.getInfoForLogin}&email=${encodeURIComponent(
          email,
        )}&business_id=${businessId}`,
      ).then((response: any) => {
        console.log(' verify business  response :', response);
        let result = JSON.stringify(response);
        console.log('getInfoForlogin res', response);

        setLoading(false);
        // alert('error' + token);
        if (response.error) {
          console.log('getInfoForlogin error', response);
        } else {
          if (response?.is_user) {
            sendCode(email);
          } else {
            console.log('getInfoForlogin error', 'not a user');
          }
        }
      });
    } catch (error) {
      console.log('getInfoForlogin error', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    sendCode(route?.route?.params?.email);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => onBackPress()}>
          <Image
            source={require('../../../assets/arrow-back-outline.png')}
            style={styles.arrowBackIcon}
          />
        </TouchableOpacity>
        <View style={styles.headerSubContainer}>
          <Text style={styles.loginText}>{Strings.verification}</Text>
          <View>
            <Text style={styles.subText}>
              {`Enter the 4 digit pass code sent to `}
            </Text>
            <Text style={styles.emailText}>{`${email}`}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.formContainer]}>
        <Formik
          initialValues={{digitCode: ''}}
          validationSchema={validationSchemaDigitCode}
          onSubmit={values => handleLogin(values)}>
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
                style={{flex: 1}}
                enableOnAndroid={true}
                keyboardShouldPersistTaps={'handled'}
                contentContainerStyle={styles.formInnerContainer}>
                {/* Added otp label */}
                {/* <TextInput
                  placeholder={Strings.digitCode}
                  onChangeText={handleChange('digitCode')}
                  onBlur={handleBlur('digitCode')}
                  value={values.digitCode}
                  style={styles.input}
                /> */}
                <DigitCodeInput
                  cellCount={4}
                  codeFieldStyle={styles.codeFieldStyle}
                  placeholder={Strings.digitCode}
                  setValue={handleChange('digitCode')}
                  onBlur={handleBlur('digitCode')}
                  value={values.digitCode}
                />
                {touched.digitCode && errors.digitCode && (
                  <Text style={styles.error}>{errors.digitCode}</Text>
                )}

                {loginError != '' && (
                  <Text style={styles.error}>{loginError}</Text>
                )}
              </KeyboardAwareScrollView>

              <View style={[styles.actionBtnContainer]}>
                <ActionButton
                  text={'Submit'}
                  showLoader={true}
                  isLoading={isLoading}
                  onPress={handleSubmit}
                />
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.resendBtn}
                  onPress={() =>
                    preLoginCheck(email, businessDetails.business_id)
                  }>
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: themeColors?.textColorBase,
                        fontSize: fontPixel(16),
                      },
                    ]}>
                    {'Resend code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </View>
      <ChooseStore
        isModalVisible={showStoreSelector}
        setModalVisible={setShowStoreSelector}
        business={businesses}
        setSelectedBusiness={(business: object) =>
          setSelectedBusiness(business)
        }
        selectedBusiness={selectedBusiness}
      />
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
      tintColor: themeColors?.textColorStrong,
    },
    headerContainer: {
      marginTop: heightPercentageToDP('3%'),
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    headerSubContainer: {},
    formInnerContainer: {
      justifyContent: 'center',
      flex: 0.4,
      paddingTop: heightPixel(10),
    },
    emailText: {
      fontFamily: textStyles.bold.fontFamily,
      color: themeColors?.textColorStrong,

      fontSize: fontPixel(17),
      fontWeight: '500',
      width: ScreenWidth * 0.8,
      marginTop: heightPixel(5),
    },
    subText: {
      color: themeColors?.textColorMedium,

      fontSize: fontPixel(17),
      fontFamily: textStyles.regular.fontFamily,
      fontWeight: '500',
      width: ScreenWidth * 0.8,
      marginTop: heightPixel(5),
    },
    formContainer: {
      flex: 1,
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    loaderStyle: {
      position: 'relative',
      marginTop: heightPercentageToDP('5%'),
    },
    error: {
      color: 'red',
      marginBottom: 0,
      marginTop: 20,
      marginHorizontal: 10,
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
      marginTop: heightPercentageToDP('3%'),
    },
    buttonText: {
      color: 'white',
      fontSize: fontPixel(18),
      fontWeight: 'bold',
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

    loginText: {
      fontSize: fontPixel(35),
      fontWeight: 'bold',
      color: themeColors?.textColorStrong,
      marginTop: 10,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
      color: themeColors?.textColorStrong,
    },
    codeFieldStyle: {
      backgroundColor: themeColors?.backgroundColor,
      paddingVertical: 10,
      paddingHorizontal: 0,
      marginBottom: 10,
      marginTop: 5,
      width: '100%',
      height: heightPixel(70),
      color: themeColors?.textColorStrong,
    },
    resendBtn: {
      backgroundColor: 'transparent',
      padding: 5,
      borderRadius: 5,
      width: '100%',
      alignItems: 'center',
      height: heightPixel(70),
      justifyContent: 'center',
      marginTop: heightPercentageToDP('3%'),
    },
  });

export default LoginWithOTP;
