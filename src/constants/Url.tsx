import {AsyncValues} from './AsyncStorage';
import {NativeModules} from 'react-native';
import config from '../../env.config';

const base_url = config.APIURL;
// const base_url_app = 'http://dev-api.omnifyapp.com/';

// const base_url_api = 'https://api.getomnify.com/';
// const base_url_app = 'http://app.omnify.info/';


// const base_url_api = 'https://dev-api.omnifyapp.com/';
// const base_url_app = 'https://app.getomnify.website/';



// const base_url_api = 'https://api-preprod.getomnify.com/';
// const base_url_app = 'https://preprod-app.getomnify.com/';
// const  appDomainName    = '.getomnify.com';
// const appDomainHost = 'https://app.getomnify.com';
const  appDomainName    = '.getomnify.website';
const appDomainHost = 'https://app.getomnify.website'
const base_url_api = 'https://api.getomnify.website/';
const base_url_app = 'https://app.getomnify.website/';



export const urls = {
  appDomainName,
  appDomainHost,
  login: 'login',
  getInfoForLogin:
    base_url_app + 'v2/apiv2/nonsession.json?method=getInfoForLogin',
  sendOTPForLogin: base_url_app + 'v2/apiv2/nonsession.json?method=sendOTP',
  searchCustomer: base_url_api + 'v1/customers/search',
  checkOTP: 'login/checkOTP/',
  sendOTP:base_url_app +'v2/apiv2/nonsession.json?method=sendOTP',
  verifyOTP:'/login/checkOTP/',
  sendForgotPasswordLink:  base_url_app +'v2/Apiv2/nonsession.json?method=sendResetPasswordMailToUser',
  business:base_url_api +'v1/businesses/',
  businessApp:base_url_app +'v1/businesses/',
  businessDetails: '/meta',
  sendDeviceToken:'/device-tokens/',
  fetchCustomFields:'/customfields.json?page_location=signup',
  registerUser:base_url_app + 'v2/apiv2/nonsession.json?method=signupCustomer'

};
