import { SET_INITIAL_ROUTE, SET_OPENED_VIA_NOTIFICATION } from "./types";




export const setInitialRoute = (route:string) => {
    return {
      type: SET_INITIAL_ROUTE,
      payload: route,
    };
  };

  export const setAppOpenedViaNotification = (value:boolean) => {
    return {
      type: SET_OPENED_VIA_NOTIFICATION,
      payload: value,
    };
  };