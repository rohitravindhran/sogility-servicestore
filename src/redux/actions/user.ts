import {LOGIN_USER, SAVE_TOKEN, SAVE_USER, SET_BUSINESS_ID, SET_MULTILOCATIONS_DOMAIN, USER_LOG_OUT} from './types';
import {useSelector, useDispatch} from 'react-redux';

export const saveUser = (userDetails:object) => {
  return {
    type: SAVE_USER,
    payload: userDetails,
  };
};

export const userLogOut = () => {
  return {
    type: USER_LOG_OUT,
  };
};

export const saveToken = (token:string) => {
  return {
    type: SAVE_TOKEN,
    payload: token,
  };
};


export const setBusinessId = (bid:string) => {
  return {
    type: SET_BUSINESS_ID,
    payload: bid,
  };
};

export const loginUser = (data:any) => {
  return {
    type: LOGIN_USER,
    payload: data,
  };
};

export const setMultilocationDomains = (data:any) => {
  return {
    type: SET_MULTILOCATIONS_DOMAIN,
    payload: data,
  };
};