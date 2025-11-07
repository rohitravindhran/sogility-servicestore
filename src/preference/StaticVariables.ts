import { Images } from "../constants/Images";

export default {
  // Platform
  PLATFORM_ANDROID: 'android',
  PLATFORM_IOS: 'ios',
  // Storage
  KEY_USER: 'UserDetails',
  ASYNC_LANG: 'LangSelected',
  USER_TOKEN: 'UserToken',
  // Stack Type
  SPLASH_STACK: 'SplashStack',
  AUTH_STACK: 'AuthStack',
  APP_STACK: 'AppStack',

  // Navigation
  DRAWER_STACK: 'Drawer',
  TAB_STACK: 'Tab',
  HOME_STACK: 'HomeStack',

  // API Response
  API_SUCCESS: '',
  API_FAILURE: '',
  API_TOKEN_EXPIRED: 'Signature verification failed: Token expired',
  API_DUPLICATE_LOGIN: 'User logged in elsewhere. Login again.',
  API_MISSING_TOKEN: 'No access token provided',

  // Common
  EMPTY_STRING: '',
  EMPTY_ARRAY: [],
  EMPTY_OBJECT: {},

  //Theme
  THEME_LIGHT: 'light',
  THEME_DARK: 'dark',

 BOTTOM_MENU:[
    {label: 'Home', route: 'home',icon:Images.homeMenu},
    {label: 'Schedules',  route: 'schedules',icon:Images.schedulesMenu},
    {label: 'Subscriptions', route: 'subscriptions',icon:Images.subscriptionsMenu},
    // {label: 'Categories',  route: 'categories',icon:Images.homeMenu},
    {label: 'Profile',  route: 'profile',icon:Images.profileMenu}, 
  ]



};
