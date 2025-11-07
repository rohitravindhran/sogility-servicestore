// sagas.js

import {takeLatest, call, put} from 'redux-saga/effects';

import {
  fetchBusinessDetails,
  setBusinessDetails,
  setServiceStoreURL,
  setWebViewCookies,
} from '../actions/global';
import {
  SET_BUSINESS_DETAILS,
  FETCH_BUSINESS_DETAILS,
  LOGIN_USER,
} from '../actions/types';
import {urls} from '../../constants/Url';
import axios from 'axios';
import {getCookieArrayFromHeader} from '@helpers/Cookies';
import {showMessage} from 'react-native-flash-message';
import {saveToken, saveUser} from '@redux/actions/user';
import {Constants} from '@constants/Constants';
import * as RootNavigation from '../../../RootNavigation';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import {getBrand} from 'react-native-device-info';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import { addHeader } from '@utils/apiActions';




function* fetchBusinessSaga(action: any) {
  const payload = action.payload;
  try {
    const response = yield call(fetch, `${payload + urls.businessDetails}`);
    const data = yield response.json();
console.log('busineddetails', `${payload + urls.businessDetails}`)
    yield put(setBusinessDetails(data));
  } catch (error) {
    console.log('Error on fetching business api', error);
  }
}

function* fetchCSRFTokenSaga(action: any): Generator<any, void, any> {
  const requestData = action.payload;
  try {
    const headers = {
      'Content-Type': 'application/json',
      Referer: `${requestData?.storeURL}/home?b=t`,
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'sec-ch-ua':
        '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    };
    const response = yield call(
      fetch,
      `${requestData?.storeURL}/api/auth/csrf`,
      addHeader(headers, ''),
    );
    const data = yield response.json();
    if (data) {
      console.log('data', data);
      try {
        const cookiesResponse = yield call(
          fetchCookiesApiCall,
          requestData,
          data?.csrfToken,
        );
        console.log('response.headers.get', cookiesResponse);

        const setCookieHeader = cookiesResponse.headers.get('Set-Cookie');

        if (setCookieHeader) {
          console.log('requestData?.multiLocation', requestData?.multiLocation)
          yield put(setServiceStoreURL(requestData.storeURL));
          yield put(fetchBusinessDetails(requestData.storeURL));


          const {cookieObjects, sessionTokenExists, omnifyToken} =
            getCookieArrayFromHeader(setCookieHeader, requestData.storeURL,requestData?.multiLocation);

          if (sessionTokenExists) {
      

            let cookiesJSON = JSON.stringify(cookieObjects);
            setTimeout(() => {
              sendFCMTokenToServerApi(
                omnifyToken?.replace('; expires', ''),
                requestData?.businessId,
              );
  
            }, 1000);
          
            yield put(saveToken(omnifyToken?.replace('; expires', '')));

            yield put(
              saveUser({
                email: requestData?.email,
                storeURL: requestData?.storeURL,
              }),
            ),
              yield put(setServiceStoreURL(requestData?.storeURL));

            yield put(setWebViewCookies(cookiesJSON));

            RootNavigation?.reset(Constants?.homeRoute,{
              serviceStoreURL: requestData?.storeURL
            })
     

            console.log('cookie found');
          } else {
            // setLoginError(true);
          }
        }
      } catch (error) {
        // Handle errors here
        // yield put({ type: 'FETCH_COOKIES_FAILURE', payload: error });
      }
    }
  } catch (error) {
    console.log('Error on fetching csr api', error);
  }
}

const fetchCookiesApiCall = async (requestData: any, csrfToken: string) => {
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
  myHeaders.append('Referrer-Policy', 'strict-origin-when-cross-origin');

  const type = requestData.type;
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: `redirect=false&email=${encodeURIComponent(
      requestData.email,
    )}&password=${encodeURIComponent(
      requestData.password,
    )}&type=${type}&csrfToken=${csrfToken}&callbackUrl=${
      requestData.storeURL
    }/home?b=t&json=true`,
  };
  let apiURl = `${requestData.storeURL}/api/auth/callback/credentials?`;

  console.log('requestOptions', requestOptions);
  console.log('apiURl', apiURl);
  return fetch(apiURl, requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response;
    })
    .catch(error => {
      // Handle errors here
      console.error('API Error:--', error);
    });
};

const sendFCMTokenToServerApi = async (token: string, businessId: String) => {
  if (!token) {
    console.log('token not available');
    return;
  }
  console.log('urls', `${urls.business + businessId + urls.sendDeviceToken}`);

  var raw = {
    token: await messaging().getToken(),
    device_type: Platform.OS,
    device_details: getBrand(),
    screen_resolution: `${ScreenWidth}x${ScreenHeight}`,
  };

  let apiURl = `${urls.business + businessId + urls.sendDeviceToken}`;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.post(apiURl, raw, config);

    let result = JSON.stringify(response);

    if (response?.data?.error) {
      console.log('send fcm token response error', response?.data?.error);
    } else {
      console.log('fcm token send successfully');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

export default function* rootSaga() {
  yield takeLatest(FETCH_BUSINESS_DETAILS, fetchBusinessSaga);
  yield takeLatest(LOGIN_USER, fetchCSRFTokenSaga);
}
