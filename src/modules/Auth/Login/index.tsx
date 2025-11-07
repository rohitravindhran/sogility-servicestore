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
  saveToken,
  saveUser,
  setMultilocationDomains,
  userLogOut,
} from '../../../redux/actions/user';
import {
  fetchBusinessDetails,
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
import PasswordInput from '../../Components/Passwordinput';
import {Images} from '@constants/Images';
import styles from '../../App/Home/Components/FullScreenSpinner/style';
import {
  shortErrorFlashMessage,
  shortInfoFlashMessage,
  shortSuccessFlashMessage,
} from '@utils/flashMessage';
import {ThemeColors} from 'src/types/themeType';
import {createMultilocationArray} from '@utils/CommonActions';
import Geolocation from '@react-native-community/geolocation';
import {
  findNearestLocation,
  orderLocationsByDistance,
} from '@helpers/Common/locationHandler';
import { isLocationEnabled, promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';

interface FormValues {
  password: string;
  email: string;
  otp: string;
}
const validationSchemaWithPassword = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});
const validationSchemaWithOTP = Yup.object().shape({
  otp: Yup.string().required('OTP is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const validationSchemaWithEmail = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const Login: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const {themeData, businessDetails} = useSelector(
    (state: any) => state?.global,
  );
  const dispatch = useDispatch();
  const [validationSchema, setValidationSchema] = useState<any>(
    validationSchemaWithEmail,
  );
  const [isLoading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Checking');
  const [showBackPress, setShowBackPress] = useState(false);
  const [fcmToken, setFCMToken] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userID, setUserID] = useState('');

  const [isUser, setIsUser] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  const [otpSent, setOTPSent] = useState(false);
  const [storeURL, setStoreURL] = useState('');
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [businesses, setBusinesses] = useState<any>([]);

  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [cookies, setCookies] = useState<any>('');
  const [response, setResponse] = useState<any>('');
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  const themeColors = handleTheme(themeData);
  const styles = useStyle(themeColors);

  const locationsDummy = [
    {
      latitude: 9.46221,
      longitude: 76.879413,
      name: 'kerala',
    },
    {
      latitude: 18.51543,
      longitude: 73.912386,
      name: 'Pune',
    },
    {
      latitude: 31.63273,
      longitude: 76.402166,
      name: 'Kashmir',
    },

    {
      latitude: 12.967173,
      longitude: 77.678923,
      name: 'Bangalore',
    },
  ];

  useEffect(() => {
    setStoreURL(brandedConstants?.Constants?.storeURL);
    getFirebaseToken();
    console.log('businessDetails--', businessDetails)
  }, []);

  useEffect(() => {
    if (businessDetails) {
      checkIfMultilocation();
    }
  }, []);

  useEffect(() => {
    if (isUser) {
      setValidationSchema(
        otpSent ? validationSchemaWithOTP : validationSchemaWithPassword,
      );
    } else {
      setValidationSchema(validationSchemaWithEmail);
    }
  }, [isUser, otpSent]);

  const getFirebaseToken = async () => {
    const token = await messaging().getToken();
    setFCMToken(token);

    console.log('fcm_token', token);
  };

  const checkIfMultilocation = async () => {
    if (businessDetails?.subdomainData?.isMultiLocationBusiness) {
    

        setShowStoreSelector(true);
        console.log('businessDetails--------0000', businessDetails);
  
        setBusinesses(businessDetails?.linkedBusinesses);
        dispatch(
          setMultilocationDomains(
            createMultilocationArray(
              businessDetails?.linkedBusinesses,
              brandedConstants?.Constants?.storeURL,
            ),
          ),
        );
  
        if (Platform.OS === 'android') {
          checkIfLocationEnabled();
        } else {
          fetchLocation();
        }

     
    }
  };

  const checkIfLocationEnabled = async () => {
    const checkEnabled: boolean = await isLocationEnabled();
    console.log('checkEnabled', checkEnabled);
    if (!checkEnabled) {
      try {
        const enableResult = await promptForEnableLocationIfNeeded();
        console.log('enableResult', enableResult);
        setTimeout(() => {
          fetchLocation();

        }, 500);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        }
      }
    } else {
      fetchLocation();
    }
  };

  const fetchLocation = () => {
    setLoading(true);

    
    Geolocation.getCurrentPosition(
      data => {
        console.log('data--', data)
        if (data) {
          // console.log('location data', data);
          const {latitude, longitude} = data?.coords;
          setCurrentLocation({latitude, longitude});
          const nearestLocation = findNearestLocation(
            {latitude, longitude},
            businessDetails?.linkedBusinesses,
          );

          // console.log('location', data?.coords);
          // console.log('nearest location', nearestLocation);
          const sortedLocations = orderLocationsByDistance(
            {latitude, longitude},
            businessDetails?.linkedBusinesses,
          );
          // console.log('sortedLocations----', sortedLocations);
          setBusinesses(sortedLocations);
          setSelectedBusiness(nearestLocation);
          // setShowStoreSelector(false);
          setLoading(false);
        }
      },
      error => {
        // Error callback
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('Permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('Position unavailable');
            if (Platform.OS === 'android') {
              checkIfLocationEnabled();
            }
            break;
          case error.TIMEOUT:
            console.log('Request timed out');
            break;
          default:
            console.log('An unknown error occurred:', error.message);
            break;
        }
      },
      
    );
  };

  const handleLogin = (values: FormValues) => {
    // Handle login logic here
    console.log('Login data:ff', values);
    setLoginError(false);
    setUserNotFound(false);
    setEmail(values?.email);
    setPassword(values?.password);

    AsyncValues.setItem(Strings.token, values?.email);
    if (isUser) {
  

        fetchCsrfToken(values?.password, values?.otp, otpSent);

    } else {
      if (selectedBusiness != null) {
        preLoginCheck(values?.email, businessDetails?.business_id);
      } else {
        preLoginCheck(values?.email, businessDetails?.business_id);

      }
    }
  };

  const checkIsCustomer = (email: string) => {
    if (!email) {
      console.log('email  is null');
      return;
    }
    console.log('urls', `${urls.searchCustomer}?email=${email}`);
    setLoading(true);

    try {
      Api.getAuthInstance(`${urls.searchCustomer}?email=${email}`).then(
        (response: any) => {
          console.log(' check customer  response :', response);
          let result = JSON.stringify(response);
          setLoading(false);
          // alert('error' + token);
          if (response.error) {
            console.log('check customer errorss');
          } else {
            console.log('check customer error', response?.data?.businesses);
            if (response?.data?.businesses) {
              setBusinesses(response?.data?.businesses);
              setUserID(response?.data?.user_id);
              if (response?.data?.businesses.length > 0) {
                if (brandedConstants?.Constants.whiteLabelledApp) {
                  setSelectedBusiness(response?.data?.businesses);
                  let userExist = response?.data?.businesses.some(
                    (item: any) =>
                      item?.business_id == businessDetails?.business_id,
                  );

                  console.log(
                    'businessDetails?.business_id',
                    businessDetails?.business_id,
                  );
                  if (userExist) {
                    setSelectedBusiness(
                      response?.data?.businesses.find(
                        (item: any) =>
                          item?.business_id == businessDetails?.business_id,
                      ),
                    );
                    preLoginCheck(email, businessDetails?.business_id);
                  } else {
                    navigation.navigate(Constants.signupRoute, {email: email});
                    dispatch(setServiceStoreURL(storeURL));

                  }
                } else {
                  setShowStoreSelector(true);
                }
              }
            } else {
              setUserNotFound(true);
              navigation.navigate(Constants.signupRoute, {email: email});
              dispatch(setServiceStoreURL(storeURL));

            }
          }
        },
      );
    } catch (error) {
      console.log('check customer error', error);
      setLoading(false);
    }
  };

  const preLoginCheck = (email: string, businessId: string) => {
    console.log('email---', email, businessId);
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
            if (response?.is_customer) {
              setOTPSent(response?.otp_sent);
              setIsUser(true);
            } else {
              navigation.navigate(Constants.signupRoute, {email: email});
              dispatch(setServiceStoreURL(storeURL));

            }
          } else {
            navigation.navigate(Constants.signupRoute, {email: email});
            dispatch(setServiceStoreURL(storeURL));

            console.log('getInfoForlogin error', 'not a user');
          }
        }
      });
    } catch (error) {
      console.log('getInfoForlogin error', error);
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('urls', `${storeURL}/welcome/logout`);
    setLoading(true);

    // Define the request body (data you want to send to the server)
    const data = {};

    // Create the request headers
    const headers = {
      'Content-Type': 'application/json', // Set the content type to JSON
      // Add any other headers as needed
    };

    // Create the request options
    const requestOptions = {
      method: 'POST', // HTTP method
      headers: headers,
      body: JSON.stringify(data), // Convert data to JSON string
    };

    // Make the POST request
    fetch(`${storeURL}/welcome/logout`, requestOptions)
      .then(response => response.json()) // Parse the response to JSON
      .then(data => {
        console.log('Response data:', data);
        // Handle the response data as needed
      })
      .catch(error => {
        console.error('Error:', error);
        setLoginError(true);
        setLoading(false);
        // Handle any errors that occurred during the request
      });
  };

  // const loginWithOTP = (email: string, storeURL: string, otp: string) => {
  //   if (!email || !storeURL || !otp) {
  //     console.log('email or store url is null');
  //     return;
  //   }
  //   console.log('urls', `${storeURL}/${urls.login}`);
  //   setLoading(true);
  //   try {
  //     Api.postAppInstance(`${storeURL}/${urls.login}`, {
  //       email: email,
  //       otp: otp,
  //       allowOTPLogin: true,
  //     }).then((response: any) => {
  //       console.log(' verify login  response :', response);
  //       let result = JSON.stringify(response);
  //       setLoading(false);
  //       // alert('error' + token);
  //       if (response.error) {
  //         console.log('login error', response);
  //       } else {
  //         if (response?.success) {
  //           loginSuccess(response?.access_token, email, storeURL, response);
  //         } else {
  //           setLoginError(true);
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     console.log('getInfoForlogin error', error);
  //     setLoading(false);
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
        if (data) {
          fetchCookies(data?.csrfToken, password, otp, otpLogin);
        } else {
          showMessage(
            shortErrorFlashMessage(themeColors, 'Something went wrong'),
          );
        }

        // Handle the response data as needed
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);

        // Handle errors
      });
  };
  const fetchCookies = (
    csrf: string,
    password: string,
    otp: string,
    otpLogin: boolean,
  ) => {
    setLoading(true);

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    myHeaders.append('Referrer-Policy', 'strict-origin-when-cross-origin');
    myHeaders.append('User-Agent', `${`Service-Store-App-${fcmToken}`}`);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: `redirect=false&email=${encodeURIComponent(
        email,
      )}&password=${encodeURIComponent(otpSent ? otp : password)}&type=${
        otpSent ? 'otp' : 'email'
      }&csrfToken=${csrf}&callbackUrl=${storeURL}/home?b=t&json=true`,
    };
    let apiURl = `${storeURL}/api/auth/callback/credentials?`;

    console.log('requestOptions', requestOptions);
    console.log('apiURl', apiURl);

    fetch(apiURl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Get the "Set-Cookie" header from the response
        const setCookieHeader = response.headers.get('Set-Cookie');
        setLoading(true);

        if (setCookieHeader) {
          dispatch(setServiceStoreURL(storeURL));
          if (businessDetails?.subdomainData?.isMultiLocationBusiness) {
            dispatch(fetchBusinessDetails(storeURL));
          }
          getCookieArrayFromHeader(
            setCookieHeader,
            storeURL,
            businessDetails?.subdomainData?.isMultiLocationBusiness,
          );

          const {cookieObjects, sessionTokenExists, omnifyToken} =
            getCookieArrayFromHeader(
              setCookieHeader,
              storeURL,
              businessDetails?.subdomainData?.isMultiLocationBusiness,
            );

          if (sessionTokenExists) {
            setLoading(true);
            setLoadingText('Logging in...');
            setTimeout(() => {
              redirectToHome(
                cookieObjects,
                omnifyToken?.replace('; expires', ''),
              );
            }, 1000);
            // console.log('cookie found');
          } else {
            setLoginError(true);
            setLoading(false);
          }
        }
        return response.json();
      })
      .then(data => {
        console.log('API Response:', data);
      })
      .catch(error => {
        setLoginError(true);
        setLoading(false);
        console.log('API Response:', error);

      });
  };

  const sendFCMTokenToServer = async (token: string) => {
    if (!token) {
      console.log('token not available');
      return;
    }
    console.log(
      'urls',
      `${urls.business + businessDetails?.business_id + urls.sendDeviceToken}`,
    );
    setLoading(true);

    // console.log('getDeviceName', getBrand())
    var raw = {
      token: await messaging().getToken(),
      device_type: Platform.OS,
      device_details: 'realme',
      screen_resolution: `${ScreenWidth}x${ScreenHeight}`,
    };

    let apiURl = `${
      urls.business + businessDetails?.business_id + urls.sendDeviceToken
    }`;

    console.log('requestOptions', raw);
    console.log('apiURl', apiURl);
    console.log('raw', token);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.post(apiURl, raw, config);
      // console.log('Response:', response.data);

      let result = JSON.stringify(response);
      console.log('send fcm token response', response);

      // alert('error' + token);
      if (response?.data?.error) {
        console.log('send fcm token response error', response?.data?.error);
      } else {
        console.log('fcm token send successfully');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const redirectToHome = (cookies: any, token: string) => {
    showMessage(shortSuccessFlashMessage(themeColors, 'Logging In'));

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

    // console.log('API Response: cookies', cookies);

    navigation.replace(Constants.homeRoute, {
      serviceStoreURL: storeURL,
    });
  };

  const onBackPress = () => {
    if (isUser) {
      setIsUser(false);
      setEmail('');
      setOTPSent(false);
      setSelectedBusiness(null);
      setBusinesses([]);
      setLoginError(false);
    } else {
      // navigation.replace(Constants.homeRoute, {
      //       serviceStoreURL: brandedConstants?.Constants?.storeURL,
      //     });
      //   }
      navigation.goBack();
    }
  };

  //Render backPress Button
  useEffect(() => {
    if (isUser) {
      setShowBackPress(true);
    } else {
      // setShowBackPress(navigation?.canGoBack());
      setShowBackPress(false);
    }
  }, [isUser, navigation]);

  useEffect(() => {
    if (selectedBusiness != null) {
      if (businessDetails?.subdomainData?.isMultiLocationBusiness) {
        //   setStoreURL(brandedConstants?.Constants?.storeURL);
        // }else{
        //   setStoreURL(brandedConstants?.Constants?.storeURL);
        console.log('selectedBusiness?.storeUrl', selectedBusiness?.storeUrl);
        setStoreURL(selectedBusiness?.storeUrl);
        

        setIsUser(false);
        setOTPSent(false);
        setEmail('');
      }
    }
  }, [selectedBusiness]);

  // useEffect(() => {
  //   console.log('storeURL', storeURL);
  // //   showToastable({
  // //     title: 'React Native Heroes',
  // //     message: 'We are the heroes of React Native 🚀',
  // //     status: 'info',
  // // })

  // }, [storeURL])

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {showBackPress && (
          <TouchableOpacity onPress={() => onBackPress()}>
            <Image source={Images.backArrow} style={styles.arrowBackIcon} />
          </TouchableOpacity>
        )}
        <Text
          style={[
            styles.loginText,
            !showBackPress && {marginTop: heightPercentageToDP('4%')},
          ]}>
          Get Started
        </Text>
      </View>
      {selectedBusiness != null &&
        businessDetails?.subdomainData?.isMultiLocationBusiness && (
          <TouchableRipple
            borderless={true}
            rippleColor={Colors.selectedItemBg}
            onPress={() => setShowStoreSelector(true)}
            style={styles.selectedStore}
            // rippleColor="rgba(102, 114, 229, 0.15)"
          >
            <View style={styles.selectOptions}>
              <View style={styles.storeIconGradient}>
                <Image source={Images?.store} style={styles.storeIcon} />
              </View>
              <Text style={styles.storeName}>
                {selectedBusiness?.display_text}
              </Text>
              <Image source={Images?.next} style={styles.dropdownArrow} />
            </View>
          </TouchableRipple>
        )}
      <View style={[styles.formContainer]}>
        <Formik
          initialValues={{email: '', password: '', otp: ''}}
          validationSchema={validationSchema}
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
                enableOnAndroid={true}
                keyboardShouldPersistTaps={'handled'}
                style={{flex: 1}}>
                <Text style={styles.inputLabel}>Enter your email address</Text>
                {/* Added email label */}
                <TextInput
                  placeholder="johndoe@acme.com"
                  placeholderTextColor={
                    themeColors?.textColorMedium ?? Colors.textcolor
                  }
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  style={styles.input}
                />
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}
                {isUser && otpSent ? (
                  <>
                    <Text style={styles.inputLabel}>OTP</Text>
                    {/* Added OTP label */}
                    <TextInput
                      placeholder="Enter OTP"
                      placeholderTextColor={
                        themeColors?.textColorMedium ?? Colors.textcolor
                      }
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
                  </>
                ) : (
                  isUser && (
                    <>
                      <Text style={styles.inputLabel}>Password</Text>
                      {/* Added password label */}

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
                    </>
                  )
                )}

                {isUser && (
                  <View style={styles.userBtnContainer}>
                    {loginError && (
                      <Text style={[styles.error, styles.loginError]}>
                        {otpSent
                          ? 'Invalid OTP'
                          : 'Email or password is incorrect'}
                      </Text>
                    )}
                    <TouchableOpacity
                      style={styles.forgotPasswordContainer}
                      activeOpacity={0.5}
                      onPress={() =>
                        navigation.navigate('forgotPassword', {
                          email: email,
                          userID: userID,
                        })
                      }>
                      <Text style={styles.forgotPasswordText}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* {userNotFound && (
                <Text style={styles.error}>
                  {'No account associated with the email'}
                </Text>
              )} */}
              </KeyboardAwareScrollView>

              <View style={[styles.actionBtnContainer]}>
                <ActionButton
                  text={'Continue'}
                  loadingText={loadingText}
                  showLoader={true}
                  isLoading={isLoading}
                  onPress={handleSubmit}
                />
                {isUser && (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    style={styles.loginWithOTP}
                    onPress={() =>
                      navigation.navigate('loginWithOtp', {email: email})
                    }>
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: themeColors?.buttonColor,
                          fontSize: fontPixel(16),
                        },
                      ]}>
                      Login with One-time Passcode
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* <FullScreenSpinner
                isLoading={isLoading}
                transparent={false}
                loaderStyle={styles.loaderStyle}
                color={'#6672e5'}
              /> */}
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
        useCurrentLocation={() => fetchLocation()}
      />
    </View>
  );
};

const useStyle = (themeColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors?.backgroundColor,
      width: ScreenWidth,
    },
    arrowBackIcon: {
      width: 22,
      height: 22,
      marginStart: 5,
      tintColor: themeColors?.textColorStrong,
    },
    dropdownArrow: {
      width: 22,
      height: 22,
      marginStart: 5,
      tintColor: themeColors?.textColorStrong,
      transform: [{rotate: '90deg'}],
    },
    selectedStore: {
      borderRadius: 30,
      alignSelf: 'center',
      paddingHorizontal: 8,
      justifyContent: 'center',
      position: 'absolute',
      top: 120,
      left: 20,
      backgroundColor: themeColors?.surfaceColorHover,
      borderColor: themeColors?.buttonColor,
      borderWidth: 1,
      height: 50,
    },
    storeIcon: {
      width: 18,
      height: 18,
      tintColor: themeColors?.buttonColor,
    },
    storeIconGradient: {
      backgroundColor: themeColors?.surfaceColorSelected,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 40,
    },
    storeName: {
      fontSize: 16,
      fontFamily: textStyles.bold.fontFamily,
      color:  themeColors?.textColorStrong,
      fontWeight: 'bold',
      alignSelf: 'center',
      paddingEnd: 5,
      paddingStart: 10,
    },
    formContainer: {
      flex: 1,
      paddingVertical: 20,
      paddingHorizontal: 20,
      marginTop: heightPercentageToDP('15%'),
    },
    loaderStyle: {
      position: 'relative',
      marginTop: heightPercentageToDP('5%'),
    },
    error: {
      color: 'red',
      marginBottom: 5,
    },
    loginError: {
      position: 'absolute',
    },
    forgotPasswordContainer: {alignItems: 'center'},
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
    userBtnContainer: {
      justifyContent: 'center',
    },
    forgotPasswordText: {
      alignSelf: 'flex-end',
      color: themeColors?.buttonColor,
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
      marginTop: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: themeColors?.borderColor,
      borderRadius: 5,
      backgroundColor: themeColors?.surfaceColor,

      padding: 10,
      marginBottom: 10,
      marginTop: 8,
      width: '100%',
      textAlignVertical: 'center',
      alignItems: 'center',
      height: heightPixel(70),
      color: themeColors?.textColorStrong,
    },
  });

export default Login;
