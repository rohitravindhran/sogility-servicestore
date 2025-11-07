import {

  SET_LOADING,
  SET_SERVICE_STORE_URL,
  SET_WEBVIEW_COOKIES,
  SET_IS_MAINROUTE,
  SET_CURRENT_ROUTE,
  SET_BUSINESS_DETAILS,
  FETCH_BUSINESS_DETAILS,
  SET_IS_ONLINE


} from './types';



export const setLoading = (value:boolean) => {
  return {
    type: SET_LOADING,
    payload: value,
  };
};


export const setServiceStoreURL = (url:string) => {
  return {
    type: SET_SERVICE_STORE_URL,
    payload: url,
  };
};


export const setWebViewCookies = (cookies:string) => {
  return {
    type: SET_WEBVIEW_COOKIES,
    payload: cookies,
  };
};


export const setIsMainRoute = (value:boolean) => {
  return {
    type: SET_IS_MAINROUTE,
    payload: value,
  };
};

export const setCurrentRoute = (value:string) => {
  return {
    type: SET_CURRENT_ROUTE,
    payload: value,
  };
};

export const setBusinessDetails = (value:any) => {
  return {
    type: SET_BUSINESS_DETAILS,
    payload: value,
  };
};

export const fetchBusinessDetails = (value:string) => {
  return {
    type: FETCH_BUSINESS_DETAILS,
    payload: value,
  };
};

export const setIsOnline = (value:boolean) => {
  return {
    type: SET_IS_ONLINE,
    payload: value,
  };
};