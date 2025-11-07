import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {ParamListBase, useNavigation} from '@react-navigation/native';
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
import FullScreenSpinner from '../../App/Home/Components/FullScreenSpinner';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {showMessage} from 'react-native-flash-message';
import {Constants} from '../../../constants/Constants';
import {forgotPasswordApi, preLoginCheckApi} from '../../../services/Api/Auth';
import {getCookieArrayFromHeader} from '../../../helpers/Cookies';
import brandedConstants from '../../../brandedConstants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import handleTheme from '../../../helpers/HandleTheme';
import ActionButton from '../../Components/ActionButton';
import { GlobalStyles } from '@utils/GlobalStyles';
import { shortSuccessFlashMessage } from '@utils/flashMessage';

interface FormValues {
  email: string;
}
const validationSchemaEmail = Yup.object().shape({
  email: Yup.string().required('Please enter your email'),
});

const ForgotPassword: React.FC = (route: any) => {
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
  const [storeURL, setStoreURL] = useState('');
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
    setEmail(values?.email);
    checkIsCustomer(values?.email);
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
          // console.log(' check customer  response :', response);
          let result = JSON.stringify(response);
          setLoading(false);
          // alert('error' + token);
          if (response.error) {
            console.log('check customer errorss');
          } else {
            // console.log('check customer error', response?.data?.businesses);
            if (response?.data?.businesses) {
              setUserID(response?.data?.user_id);
              if (response?.data?.businesses?.length > 0) {
                if (brandedConstants?.Constants.whiteLabelledApp) {
                  setSelectedBusiness(response?.data?.businesses[0]);
                  let userExist = response?.data?.businesses.some(
                    (item: any) =>
                      item?.business_id == businessDetails?.business_id,
                  );

                  if (userExist) {
                    sendCode(email, response?.data?.user_id);
                  } else {
                    setLoginError('No account associated with the email');
                  }
                } else {
                  setShowStoreSelector(true);
                }
              }
            } else {
              setLoginError('No account associated with the email');
            }
          }
        },
      );
    } catch (error) {
      console.log('check customer error', error);
      setLoading(false);
    }
  };

  const sendCode = (email: string, userId: string) => {
    console.log('userId', userId);
    try {
      let data = {
        business_id: businessDetails?.business_id,
        user_id: userId,
      };
    
      forgotPasswordApi(data).then((response: any) => {
        console.log('forgotPasswordApi response :', response);
        let result = JSON.stringify(response);
        setLoading(false);
        // alert('error' + token);
        if (response.error) {
          console.log('forgotPasswordApi error', response);
        } else {
          if (response.success) {
            showMessage(shortSuccessFlashMessage(themeColors,Strings?.forgotPasswordSent));
          }
        }
      });
    } catch (error) {
      console.log('forgotPasswordApi error', error);
      
    }
  };



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
          <Text style={styles.loginText}>{Strings.forgotPassword}</Text>
          <Text style={styles.subText}>
            Enter your email below to get a reset password link
          </Text>
        </View>
      </View>

      <View style={[styles.formContainer]}>
        <Formik
          initialValues={{email: email}}
          validationSchema={validationSchemaEmail}
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
                keyboardShouldPersistTaps={'handled'}
                enableOnAndroid={true}

                style={{flex: 1}}
                contentContainerStyle={{
                  justifyContent: 'center',
                  flex: 0.4,
                  paddingTop: heightPixel(10),
                }}>
                <Text style={styles.inputLabel}>Email Address</Text>
                {/* Added email label */}
                <TextInput
                  placeholder={Strings.email}
                  placeholderTextColor={'#fff'}
                  
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  style={styles.input}
                />
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors?.email}</Text>
                )}
                {loginError != '' && (
                  <Text style={styles.error}>{loginError}</Text>
                )}
              </KeyboardAwareScrollView>

              <View style={[styles.actionBtnContainer]}>
            
                <ActionButton
                  text={'Request reset link'}
                  showLoader={true}
                  isLoading={isLoading}
                  onPress={handleSubmit}
                  />
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.resendBtn}
                  onPress={()=>navigation?.goBack()}>
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: themeColors?.textColorBase,
                        fontSize: fontPixel(16),
                      },
                    ]}>
                    {'Back to Login'}
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
      backgroundColor:themeColors?.backgroundColor
    },
    arrowBackIcon: {
      width: 22,
      height: 22,
      tintColor: themeColors?.textColorStrong,

    },
    headerContainer:{
      marginTop: heightPercentageToDP('3%'),
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    headerSubContainer:{
  
    },
    subText:{
      color: themeColors?.textColorMedium,
      
      fontSize: fontPixel(17),
      fontFamily: textStyles.regular.fontFamily,
      fontWeight:'500',
      width:ScreenWidth * 0.8,
      marginTop:heightPixel(5),
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
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      marginTop: 8,
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

export default ForgotPassword;
