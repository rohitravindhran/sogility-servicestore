import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {Constants} from '../../constants/Constants';
import {Strings} from '../../constants/Strings';

import StaticVariables from '../../preference/StaticVariables';
import {store} from '../../redux/store';
import NetworkProvider from '../Network';
import {refreshAccessToken} from './refreshToken';
import config from '../../../env.config';

// Define the type for the user data
interface UserData {
  user: any; // Replace 'any' with the actual type of 'user'
}

// Define the store state type
interface AppState {
  user: UserData | null;
}

// Initialize storeData
const storeData: any = {};

// Create Axios instances
const authInstance: AxiosInstance = axios.create({
  baseURL: config.APIURL,
  validateStatus: status => status === 200 || status === 401,
});

authInstance.defaults.headers.common['Content-Type'] = 'multipart/form-data';

authInstance.defaults.timeout = 40000;

const appInstance: AxiosInstance = axios.create({
  baseURL: config.APIURL,
  validateStatus: status => status === 200 || status === 401,
});

appInstance.defaults.headers.common['Content-Type'] = 'multipart/form-data';

appInstance.defaults.timeout = 25000;

export const setToken = (token: string | undefined) => {
  console.log('token', token);
  appInstance.defaults.headers.common.Authorization = token
    ? `Bearer ${token}`
    : '';
};

function handleStore() {
  const newState: AppState = store.getState();
  if (newState.user?.user !== null) {
    storeData.user = newState.user.user;
  }
}

// Create a type for the API response data
interface ApiResponse {
  response_code: number;
  message: string;
  // Add any other fields from the API response data here
}

// Define the API service methods
const ApiService = {
  postAuthInstance(url: string, data: any): Promise<any> {
    return authInstance
      .post(url, data)
      .then((response: AxiosResponse<ApiResponse>) => {
        console.log(response);
        return response.data;
      })
      .catch(error => {
        console.log(error);
        return false;
      });
  },

  getAuthInstance(url: string): Promise<any> {
    return authInstance
      .get(url)
      .then((response: AxiosResponse<ApiResponse>) => {
        return response.data;
      })
      .catch(error => {
        console.log(error);
        return false;
      });
  },

  async postAppInstance(url: string, data: any): Promise<any> {
    try {
      const response: AxiosResponse<ApiResponse> = await appInstance.post(
        url,
        data,
      );

      // Check token expiry
      if (
        (response?.data?.response_code === Constants.expiredToken &&
          response?.data?.message === Strings.expiredTokenMsg) ||
        (response?.data?.response_code === Constants.forbidden &&
          response?.data?.message === Strings.expiredTokenMsg)
      ) {
        // Handle Token expired event
        console.log(
          'token refresh initiated',
          'url:',
          url,
          'response',
          response,
        );
        await refreshAccessToken();
      } else {
        // Return response
        return response.data;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async getAppInstance(url: string): Promise<any> {
    try {
      const response: AxiosResponse<ApiResponse> = await appInstance.get(url);

      // Check token expiry
      if (
        (response?.data?.response_code === Constants.expiredToken &&
          response?.data?.message === Strings.expiredTokenMsg) ||
        (response?.data?.response_code === Constants.forbidden &&
          response?.data?.message === Strings.expiredTokenMsg)
      ) {
        // Handle Token expired event
        console.log(
          'token refresh initiated',
          'url:',
          url,
          'response',
          response,
        );
        await refreshAccessToken();
      } else {
        // Return response
        return response.data;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  async patchAppInstance(url: string, data: any): Promise<any> {
    try {
      const response: AxiosResponse<ApiResponse> = await appInstance.patch(
        url,
        data,
      );
      console.log(response);
      // Check token expiry
      if (
        (response?.data?.response_code === Constants.expiredToken &&
          response?.data?.message === Strings.expiredTokenMsg) ||
        (response?.data?.response_code === Constants.forbidden &&
          response?.data?.message === Strings.expiredTokenMsg)
      ) {
        // Handle Token expired event
        await refreshAccessToken();
      } else {
        // Return response
        return response.data;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};

export default ApiService;
