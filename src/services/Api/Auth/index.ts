import { getUrls } from '../../../../services/EnvironmentService';
import { urls } from '../../../constants/Url';
import Api from '../index';

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
  const envUrls = getUrls();
  const fetchUrl = `${envUrls.businessApp + businessId + envUrls.fetchCustomFields}`;
  console.log('urls.fetchCustomFields (env-based):', fetchUrl);
  return Api.getAuthInstance(fetchUrl);
}

export function registerUserApi(data: Object) {
  const envUrls = getUrls();
  console.log('urls.registerUser (env-based):', envUrls.registerUser);
  return Api.postAuthInstance(envUrls.registerUser, data);
}