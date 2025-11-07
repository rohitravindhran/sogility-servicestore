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
import {Field, Formik} from 'formik';
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
  forgotPasswordApi,
  preLoginCheckApi,
  registerUserApi,
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
import CheckBox from '@react-native-community/checkbox';
import RNDateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import PickerSelect from '@modules/Components/PickerSelect';
import {makePickerArray} from '@utils/makePickerArray';
import MultiSelect from '@modules/Components/MultiSelect';
import DatePicker from 'react-native-date-picker';
import {getDateString, getDateStringFromDate} from '@helpers/Date';
import SetPassword from '../SetPassword/index';
import {
  checkIsEmpty,
  getErrorMessage,
  getInitValues,
  makeCustomFieldDataForApi,
} from '@utils/customFields';
import {Images} from '@constants/Images';
import brandedConstants from '@brandedConstants/index';
import {shortSuccessFlashMessage} from '@utils/flashMessage';

interface FormValues {
  firstName: String;
  lastName: String;
  email: String;
  phoneNumber: String;
}

const CustomFields: React.FC = (route: any) => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const {themeData, businessDetails,serviceStoreURL} = useSelector((state:any)  => state?.global);
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState(false);

  const [loginError, setLoginError] = useState(false);
  const [customFields, setCustomFields] = useState<any>([]);

  const themeColors = handleTheme(themeData);
  const styles = useStyle(themeColors);
  const [countryCode, setCountryCode] = useState('');
  const [validationScheme, setValidationSchema] = useState<any>();
  const [initData, setInitData] = useState<any>();
  const [formValues, setFormValues] = useState<any>([]);
  const [password, setPassword] = useState<any>(route?.route?.params?.password);
  const [userDetails, setUserDetails] = useState<any>(
    route?.route?.params?.userDetails,
  );
  const [OTPLogin, setOTPLogin] = useState(route?.route?.params?.OTPLogin);

  const registerUser = (formValues: any, userDetails: any, password: any) => {
    try {
      setLoading(true);
      let data: any = {
        email: userDetails?.email,
        firstname: userDetails.firstName,
        lastname: userDetails.lastName,
        phonenumber: userDetails.phoneNumber,

        custom_fields: makeCustomFieldDataForApi(customFields, formValues),
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
            showMessage({
              message: 'Account Created',
              type: 'success',
              icon: 'success',
              floating: true,
              duration: 1500,
              style: {backgroundColor: themeColors?.textColorSelected || Colors?.textcolor},
            });
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

  const handleSubmit = (values: FormValues) => {
    setLoginError(false);

    console.log('Form values:', formValues);

    if (customFields?.length > 0) {
      var validation = true;
      let updateFormValues: any = formValues;
      customFields?.map((item: any, id: number) => {
        if (item?.label_mandatory) {
          if (checkIsEmpty(item?.label_type, formValues[id]?.value)) {
            validation = false;
          }

          //   console.log(
          //     'Form values:error$$$$$$$$$',
          //     formValues[id]?.value,
          //     checkIsEmpty(item?.label_type, formValues[id]?.value),
          //   );

          updateFormValues = updateFormValues?.map(
            (element: any, index: number) => {
              if (id === index) {
                return {
                  ...element,
                  error: checkIsEmpty(item?.label_type, formValues[id]?.value)
                    ? getErrorMessage(item)
                    : false,
                };
              }
              return element;
            },
          );
          //   console.log('Form values:error', updateFormValues?.map(
          //     (element: any, index: number) => {
          //       if (id === index) {
          //         return {
          //           ...element,
          //           error: checkIsEmpty(item?.label_type, formValues[id]?.value)
          //             ? getErrorMessage(item)
          //             : false,
          //         };
          //       }
          //       return element;
          //     },
          //   ));
        }
      });
      console.log('validqtion after', validation);
      setFormValues(updateFormValues);

      if (validation) {
        registerUser(formValues, userDetails, password);

        console.log(
          'details',
          formValues,
          route?.route?.params?.userDetails,
          route?.route?.params?.password,
        );
      } else {
        showMessage({
          message: Strings?.fillAllFields,
          type: 'danger',
          icon: 'danger',
          floating: true,
          duration: 1500,
        });
      }
    }
  };

  const handleChange = (label: any, value: any, id: any) => {
    console.log('hanled change', value, id);

    const updateFormValues = formValues.map((item: any, index: number) => {
      if (id === index) {
        return {...item, value: value, showComponent: false};
      }
      return item;
    });

    setFormValues(updateFormValues);
  };

  const handleChangeComp = (value: boolean, id: number) => {
    console.log('hanled changecomp', value, id);

    const updateFormValues = formValues.map((item: any, index: number) => {
      if (id === index) {
        return {...item, showComponent: value};
      }
      return item;
    });

    setFormValues(updateFormValues);
  };

  useEffect(() => {
    console.log('formValues', formValues);
  }, [formValues]);

  const handleBlur = (item: any, id: any) => {
    console.log('worked', item);
    if (item?.label_mandatory) {
      console.log('worked', formValues[id]?.value);
      if (checkIsEmpty(item?.label_type, formValues[id]?.value)) {
        const updateFormValues = formValues.map(
          (element: any, index: number) => {
            if (id === index) {
              return {...element, error: getErrorMessage(item)};
            }
            return element;
          },
        );

        setFormValues(updateFormValues);
      }
    }
  };

  const fetchCustomFields = () => {
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
              setCustomFields(response?.data);

              if (response.data?.length > 0) {
                setFormValues(getInitValues(response?.data));
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

  useEffect(() => {
    fetchCustomFields();
  }, []);

  // useEffect(() => {
  //   console.log('route?.route?.params?.userDetails', route?.route?.params?.userDetails)
  //  }, [route])

  return (
    <AuthWrapper
      title={'Create Account'}
      pageNumber={3}
      userDetails={route?.route?.params?.userDetails}>
      <>
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          keyboardShouldPersistTaps={'always'}
          style={{flex: 1, marginBottom: 100}}
          showsVerticalScrollIndicator={false}>
          {customFields?.map((item: any, index: number) => {
            switch (item.label_type) {
              case 'text':
                return (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{`${item?.label_name} ${
                      item?.label_mandatory ? '*' : ''
                    }`}</Text>
                    {/* Added email label */}
                    <TextInput
                      placeholder={item?.label_name}
                      placeholderTextColor={themeColors?.textColorMedium}
                      onChangeText={text =>
                        handleChange(`${item?.label_name}`, text, index)
                      }
                      onBlur={() => handleBlur(item, index)}
                      // value={formValues[index]?.value}

                      style={styles.input}
                      returnKeyType="done"
                    />
                    {formValues[index]?.error &&
                      formValues[index]?.error != '' && (
                        <Text style={styles.error}>
                          {formValues[index].error}
                        </Text>
                      )}
                  </View>
                );
              case 'number':
                return (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{`${item?.label_name} ${
                      item?.label_mandatory ? '*' : ''
                    }`}</Text>
                    {/* Added email label */}
                    <TextInput
                      placeholder={item?.label_name}
                      placeholderTextColor={themeColors?.textColorMedium}
                      onChangeText={text =>
                        handleChange(`${item?.label_name}`, text, index)
                      }
                      onBlur={() => handleBlur(item, index)} // value={formValues[index]?.value}
                      style={styles.input}
                      keyboardType={'number-pad'}
                      returnKeyType="done"
                    />
                    {formValues[index]?.error &&
                      formValues[index]?.error != '' && (
                        <Text style={styles.error}>
                          {formValues[index].error}
                        </Text>
                      )}
                  </View>
                );

              case 'checkbox':
                return (
                  <View style={[styles.inputContainer]}>
                    <View style={styles.checkBoxContainer}>
                      <CheckBox
                        disabled={false}
                        value={formValues[index]?.value}
                        onValueChange={newValue =>
                          handleChange(`${item?.label_name}`, newValue, index)
                        }
                        boxType={'square'}
                        tintColors={{
                          true: themeColors?.buttonColor,
                          false: themeColors?.buttonColor,
                        }}
                        onFillColor={themeColors?.buttonColor}
                        onCheckColor={themeColors?.textColorTop}
                        animationDuration={0.1}
                        // style={{width:10,height:10}}
                        // lineWidth={20}
                        style={{
                          transform: [
                            {scaleX: Platform.OS == 'android' ? 1 : 0.8},
                            {scaleY: Platform.OS == 'android' ? 1 : 0.8},
                          ],
                        }}
                      />
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() =>
                          handleChange(
                            `${item?.label_name}`,
                            !formValues[index]?.value,
                            index,
                          )
                        }>
                        <Text style={styles.checkBoxlabel}>{`${
                          item?.label_name
                        } ${item?.label_mandatory ? '*' : ''}`}</Text>
                      </TouchableOpacity>
                    </View>

                    {formValues[index]?.error &&
                      formValues[index]?.error != '' && (
                        <Text style={styles.error}>
                          {formValues[index].error}
                        </Text>
                      )}
                  </View>
                );
              case 'date':
                return (
                  <View style={[styles.inputContainer, styles.dateContainer]}>
                    <Text style={styles.inputLabel}>{`${item?.label_name} ${
                      item?.label_mandatory ? '*' : ''
                    }`}</Text>
                    <View style={{paddingTop: 10}}>
                      <DatePicker
                        date={formValues[index]?.value || new Date()}
                        modal
                        mode={'date'}
                        open={formValues[index]?.showComponent}
                        onConfirm={date => {
                          handleChangeComp(false, index),
                            handleChange(`${item?.label_name}`, date, index);
                        }}
                        onCancel={() => {
                          handleChangeComp(false, index);
                          //   handleBlur(item, index);
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => handleChangeComp(true, index)}
                        style={styles.dateLabel}
                        activeOpacity={1}>
                        <TextInput
                          editable={false}
                          style={styles.dateLabelText}
                          onBlur={() => handleBlur(item, index)}
                          onPressIn={() => handleChangeComp(true, index)}>
                          {getDateString(formValues[index]?.value)}
                        </TextInput>
                        <Image
                          source={Images.calender}
                          style={styles.calenderIcon}
                        />
                      </TouchableOpacity>
                    </View>
                    {formValues[index]?.error &&
                      formValues[index]?.error != '' && (
                        <Text style={styles.error}>
                          {formValues[index].error}
                        </Text>
                      )}
                  </View>
                );
              case 'select':
                return (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{`${item?.label_name} ${
                      item?.label_mandatory ? '*' : ''
                    }`}</Text>
                    {/* Added email label */}
                    <PickerSelect
                      data={makePickerArray(item?.label_information)}
                      placeholder={`Select ${item?.label_name}`}
                      value={formValues[index]?.value}
                      setValue={(item: any) =>
                        handleChange(`${item?.label_name}`, item?.value, index)
                      }
                      style={styles.input}
                    />
                    {formValues[index]?.error &&
                      formValues[index]?.error != '' && (
                        <Text style={styles.error}>
                          {formValues[index].error}
                        </Text>
                      )}
                  </View>
                );
              case 'multiselect':
                return (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{`${item?.label_name} ${
                      item?.label_mandatory ? '*' : ''
                    }`}</Text>
                    {/* Added email label */}

                    <MultiSelect
                      data={makePickerArray(item?.label_information)}
                      value={formValues[index]?.value}
                      setValue={(item: any) =>
                        handleChange(`${item?.label_name}`, item, index)
                      }
                      placeholder={`Select ${item?.label_name}`}
                      style={styles.input}
                    />
                    {formValues[index]?.error &&
                      formValues[index]?.error != '' && (
                        <Text style={styles.error}>
                          {formValues[index].error}
                        </Text>
                      )}
                  </View>
                );
              default:
                return (
                  <View key={item.id}>
                    <Text>
                      {item.label_name} = {item.label_type}
                    </Text>
                  </View>
                );
            }
          })}
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
    checkBoxContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingStart: 0,
      marginBottom: 5,
    },
    checkBoxlabel: {
      fontSize: fontPixel(15),
      alignSelf: 'flex-start',
      color: themeColors?.textColorStrong,
      fontFamily: textStyles.regular.fontFamily,
      width: ScreenWidth * 0.8,
      paddingStart: 5,
    },
    dateContainer: {
      alignItems: 'flex-start',
    },
    dateLabel: {
      borderWidth: 1,
      borderColor: themeColors?.textColorMedium,
      width: ScreenWidth * 0.89,
      paddingHorizontal: 10,
      zIndex: 999,
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 5,
      backgroundColor: themeColors?.surfaceColor,
      marginBottom: 10,
      flexDirection: 'row',
    },
    dateLabelText: {
      color: themeColors?.textColorStrong,
      height: heightPixel(58),
    },
    calenderIcon: {
      width: widthPixel(20),
      height: widthPixel(20),
      resizeMode: 'contain',
      padding: 0,
      tintColor: themeColors?.textColorStrong,
    },
  });

export default CustomFields;
