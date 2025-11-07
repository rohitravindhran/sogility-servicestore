import {
  CardStyleInterpolators,
  StackNavigationProp,
  createStackNavigator,
} from '@react-navigation/stack';
import Home from '../modules/App/Home';
import MyComponent from '../modules/Auth/Login';
import {
  AppState,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  Text,
  View,
} from 'react-native';
import Login from '../modules/Auth/Login';
import React, {useEffect, useRef, useState} from 'react';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Strings} from '../constants/Strings';
import {AsyncValues} from '../constants/AsyncStorage';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchBusinessDetails,
  setServiceStoreURL,
} from '../redux/actions/global';
import {Constants} from '../constants/Constants';
import config from '../../env.config';
import {fontPixel} from '../utils/PixelRatio';
import {Colors} from '../constants/Colors';
import brandedConstants from '../brandedConstants';
import LoginWithOTP from '../modules/Auth/LoginWithOTP';
import ForgotPassword from '../modules/Auth/ForgotPassword';
import notifee, {EventType} from '@notifee/react-native';
import NotifService from '../utils/NotifService';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import createURLFromNotification from '../helpers/Notification/createDataFromNotification';
import {setAppOpenedViaNotification} from '../redux/actions/home';
import handleTheme from '../helpers/HandleTheme';
import Signup from '../modules/Auth/Signup';
import SetPassword from '@modules/Auth/Signup/SetPassword';
import CustomFields from '@modules/Auth/Signup/CustomFields';
import {Animated} from 'react-native';

const Stack = createStackNavigator();

export default function Screens() {
  // const appState = useRef(AppState.currentState);
  // const notif = new NotifService(onNotif, onAction, localNotif);
  const appState = useRef(AppState.currentState);
  const dispatch = useDispatch();
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const {serviceStoreURL, themeData,businessDetails} = useSelector((state:any) => state?.global);

  const [storeURL, setStoreURL] = useState(
    serviceStoreURL
  );

  const openByNotification = useSelector(
    state => state.global.openByNotification,
  );

  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  // useEffect(() => {

  //   if (Platform.OS) {
  //     PushNotification.configure({
  //       // (optional) Called when Token is generated (iOS and Android)
  //       // onRegister: function (token) {
  //       //   console.log('TOKEN:', token);
  //       // },
  //       // (required) Called when a remote or local notification is opened or received
  //       onNotification: function (notification) {
  //         console.log('worked +++++++++++++++++++++++++++++++++++++++++++++++++',notification.userInteraction)

  //         AsyncValues.setItem(
  //           Strings.notificationTarget,
  //           notification.data?.notification_target,
  //         );
  //         AsyncValues.setItem(
  //           Strings.notificationData,
  //           JSON.stringify(notification.data?.notification_data),
  //         );
  //         if (notification.userInteraction) {
  //           AsyncValues.setItem(
  //             Strings.openWithNotification,
  //             JSON.stringify(true),
  //           );

  //         }

  //         // }

  //         // process the notification here
  //         // required on iOS only
  //         notification.finish(PushNotificationIOS.FetchResult.NoData);
  //       },
  //       onAction: function (notification) {
  //         console.log('Notification action received:');
  //       },

  //       // Android only
  //       senderID: '1090501687137',
  //       // iOS only
  //       permissions: {
  //         alert: true,
  //         badge: true,
  //         sound: true,
  //       },
  //       popInitialNotification: true,
  //       requestPermissions: true,
  //     });
  //   }
  // }, []);

  const Splash = () => {
    const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
    const {token} = useSelector(state => state?.user);
    const {serviceStoreURL, themeData} = useSelector(state => state?.global);
    const dispatch = useDispatch();
    const themeColors = handleTheme(themeData);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fadeIn = () => {
      // Will change fadeAnim value to 1 in 5 seconds
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    };

    const fadeOut = () => {
      // Will change fadeAnim value to 0 in 3 seconds
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    };

    useEffect(() => {
      const checkAppInitialization = async () => {
        let openViaNotification = JSON.parse(
          await AsyncValues.getItem(Strings.openWithNotification),
        );
        console.log('openViaNotification on nvaigation', openViaNotification,brandedConstants?.Constants?.storeURL);
        
        if (businessDetails?.subdomainData?.isMultiLocationBusiness) {
          dispatch(
            fetchBusinessDetails(
              token ? serviceStoreURL : brandedConstants?.Constants?.storeURL,
            ),
          );
        } else {
          dispatch(fetchBusinessDetails(brandedConstants?.Constants?.storeURL));
        }

        if (openViaNotification) {
          dispatch(setAppOpenedViaNotification(true));
          redirect(storeURL);

          // redirect(notificationData?.initialURL);
        } else {
          redirect(storeURL);

        }
      };

      fadeIn();
      setTimeout(() => {
        fadeOut();
      }, 2500);


      setTimeout(() => {
        checkAppInitialization();
      }, 3000);
      
    }, []);

    const redirect = async (initialURL: string) => {
      console.log(
        'storeURL on redirect',
        brandedConstants?.Constants.brandName,
      );

      if (token) {
        navigation.replace(Constants.homeRoute, {
          serviceStoreURL: initialURL,
          response: null,
        });
      } else {
    
        navigation.replace(Constants?.loginRoute);

      }
      // navigation.replace(Constants.loginRoute);
    };

    return (
      <View>
        <View
          // source={brandedConstants?.Images?.splashBackground}
          style={{
            width: ScreenWidth,
            height: ScreenHeight,
            justifyContent: 'center',
            alignItems: 'center',

            backgroundColor: brandedConstants?.Colors?.splashBackground,
          }}>
          <Animated.Image
            source={brandedConstants?.Images?.splashLogo}
            style={{
              width: ScreenWidth * 0.7,
              height: ScreenWidth * 0.5,
              top: ScreenHeight * 0.3,
              resizeMode: 'contain',
              position: 'absolute',
              opacity: fadeAnim,
            }}
          />
        </View>
      </View>
    );
  };

  // const App = () => {
  //   const Stack = createStackNavigator();

  //   return (
  //     <Stack.Navigator
  //       initialRouteName="home"
  //       screenOptions={{
  //         cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
  //         headerShown: false,
  //       }}>
  //       <Stack.Screen name="home" component={Home} />
  //     </Stack.Navigator>
  //   );
  // };

  // const Auth = () => {
  //   const Stack = createStackNavigator();

  //   return (
  //     <Stack.Navigator
  //       initialRouteName="home"
  //       screenOptions={{
  //         cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
  //         headerShown: false,
  //       }}>
  //       <Stack.Screen name="home" component={Login} />
  //     </Stack.Navigator>
  //   );
  // };

  return (
    <Stack.Navigator
      initialRouteName="splash"
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerShown: false,
      }}>
      <Stack.Screen
        name="splash"
        component={Splash}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
        }}
      />

      <Stack.Screen name="home" component={Home} />
      <Stack.Screen
        name="login"
        component={Login}
        options={{
          gestureDirection: 'horizontal',
        }}
      />

      <Stack.Screen
        name="loginWithOtp"
        component={LoginWithOTP}
        options={{
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="forgotPassword"
        component={ForgotPassword}
        options={{
          gestureDirection: 'horizontal',
        }}
      />

      <Stack.Screen
        name={'signup'}
        component={Signup}
        options={{
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name={Constants?.setPassword}
        component={SetPassword}
        options={{
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name={Constants?.customFields}
        component={CustomFields}
        options={{
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
