import {urls} from '../../../constants/Url';
import Api, {setToken} from '../index';

export function preLoginCheckApi(email: string, businessId: string) {
  console.log(
    'first',
    `${urls.getInfoForLogin}&email=${email}&business_id=${businessId}`,
  );
  return Api.getAuthInstance(
    `${urls.getInfoForLogin}&email=${email}&business_id=${businessId}`,
  );
}

export function forgotPasswordApi(data: Object) {
  console.log('urls.sendForgotPasswordLink', `${urls.sendForgotPasswordLink}`,data);
  return Api.postAuthInstance(`${urls.sendForgotPasswordLink}`,data);
}

export function sendOTPApi(data: Object) {
  console.log('urls.sendOTPApi', `${urls.sendOTP}`,data);
  return Api.postAuthInstance(`${urls.sendOTP}`,data);
}

export function verifyOTPApi(data: Object) {
  console.log('urls.verifyOTPApi',`${data?.businessURL+urls.verifyOTP}?code=${data?.code}&email=${data?.email}`);
  return Api.getAuthInstance(`${data?.businessURL+urls.verifyOTP}?code=${data?.code}&email=${data?.email}`);
}

export function fetchCustomFieldsApi(businessId: String) {
  console.log('urls.fetchCustomFields',`${urls.businessApp + businessId +urls.fetchCustomFields}`);
  return Api.getAuthInstance(`${urls.businessApp + businessId + urls.fetchCustomFields}`);
}

export function registerUserApi(data: Object) {
  console.log('urls.fetchCustomFields',urls.registerUser);
  return Api.postAuthInstance(urls.registerUser,data);
}