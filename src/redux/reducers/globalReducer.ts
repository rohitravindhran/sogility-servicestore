import { getTabMenu } from '@utils/CommonActions';
import { setIsMainRoute, setBusinessDetails } from '../actions/global';
import {

  SET_IS_MAINROUTE,
  SET_LOADING,
  SET_SERVICE_STORE_URL,
  SET_WEBVIEW_COOKIES,
  SET_CURRENT_ROUTE,
  SET_BUSINESS_DETAILS,
  SET_IS_ONLINE,
} from '../actions/types';


const initialState = {

  isLoading: false,
  serviceStoreURL:'',
  webViewCookies:'',
  isMainRoute:true,
  currentRoute:'home',
  businessDetails:null,
  themeData:null,
  loginUser:false,
  menuData:[],
  isOnline:false,



};

const globalReducer = (state = initialState, action:any) => {
  switch (action.type) {

    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
  
      case SET_SERVICE_STORE_URL:
      return {
        ...state,
        serviceStoreURL: action.payload,
      };

      case SET_WEBVIEW_COOKIES:
        return {
          ...state,
          webViewCookies: action.payload,
        };

        case SET_IS_MAINROUTE:
        return {
          ...state,
          isMainRoute: action.payload,
        };

        case SET_CURRENT_ROUTE:
        return {
          ...state,
          currentRoute: action.payload,
        };

        case SET_IS_ONLINE:
        return {
          ...state,
          isOnline: action.payload,
        };


        case SET_BUSINESS_DETAILS:
          let businessDetails =  action.payload;
          return {
            ...state,
            businessDetails: businessDetails,
            themeData:businessDetails.themeData,
            menuData:getTabMenu(businessDetails?.menus)
          };

   
    default:
      return state;
  }
};

export default globalReducer;
