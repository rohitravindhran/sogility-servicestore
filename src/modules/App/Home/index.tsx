import CookieManager from '@react-native-cookies/cookies';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import React, {
  Component,
  WebViewHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  BackHandler,
  AppState,
  Linking,
} from 'react-native';
import WebView from 'react-native-webview';
import useStyle from './style';
import {Strings} from '../../../constants/Strings';
import {useDispatch, useSelector} from 'react-redux';
import {userLogOut} from '../../../redux/actions/user';
import {StackNavigationProp} from '@react-navigation/stack';
import FullScreenSpinner from './Components/FullScreenSpinner';
import {Colors} from '../../../constants/Colors';
import {
  setIsMainRoute,
  setLoading,
  setServiceStoreURL,
  setCurrentRoute,
  setBusinessDetails,
  fetchBusinessDetails,
  setWebViewCookies,
} from '../../../redux/actions/global';
import {createCookieFromObject} from '../../../helpers/Cookies';
import {Constants} from '../../../constants/Constants';
import BottomMenu from './Components/BottomMenu';
import brandedConstants from '../../../brandedConstants';
import {getCurrentDateInURLFormat} from '../../../helpers/Date';
import NavHeader from './Components/NavHeader';
import StaticVariables from '../../../preference/StaticVariables';
import {urls} from '../../../constants/Url';
import DeviceInfo from 'react-native-device-info';
import {AsyncValues} from '../../../constants/AsyncStorage';
import messaging, {firebase} from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import notifee from '@notifee/react-native';
import createURLFromNotification from '../../../helpers/Notification/createDataFromNotification';
import createDataFromNotification from '../../../helpers/Notification/createDataFromNotification';
import {setAppOpenedViaNotification} from '../../../redux/actions/home';
import getCurrentRouteData from '../../../helpers/Route';
import handleTheme from '../../../helpers/HandleTheme';
import {addQueryParam} from '../../../utils/webViewHandler';
import {showMessage} from 'react-native-flash-message';
import {JAVASCRIPT_TO_INJECT, redirectScript} from '@utils/javascriptToInject';
import {shortInfoFlashMessage} from '@utils/flashMessage';

const Home = (route: any) => {
  const {width, height} = Dimensions.get('screen');
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const [timeoutId, setTimeoutId] = useState<any>(undefined);

  const dispatch = useDispatch();
  const {token, businessId, multiLocationDomains} = useSelector(
    state => state?.user,
  );
  const {
    webViewCookies,
    isLoading,
    isMainRoute,
    currentRoute,
    businessDetails,
    themeData,
    menuData,
  } = useSelector(state => state?.global);
  const {openedViaNotification} = useSelector(state => state?.home);
  const themeColors = handleTheme(themeData);
  const style = useStyle(width, height, themeColors);

  const [storeURL, setStoreURL] = useState<any>(
    route?.route?.params?.serviceStoreURL,
  );
  const webView = useRef<WebView>();
  let currentURLRef = useRef<String>('');
  const [url, setURL] = useState(route?.route?.params?.serviceStoreURL);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [fcmToken, setFCMToken] = useState('');

  const [isLoggedIn, setIsLogged] = useState(false);

  const [hideWebView, setHideWebView] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [cookie, setCookie] = useState('');

  const [lastUrl, setLastUrl] = useState('');

  const [showMenu, setShowMenu] = useState(true);
  const [webViewKey, setWebViewKey] = useState(1);

  const [currentMenu, setCurrentMenu] = useState('');
  const [isUrlSetByNotification, setIsUrlSetByNotification] = useState(false);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const bottomMenu = StaticVariables.BOTTOM_MENU;

  //Action Handlers:

  const onAndroidBackPress = () => {
    console.log('currentUrlonbackpress', currentURLRef.current);

    if (webView.current) {
      const routeData = getCurrentRouteData(currentURLRef?.current);

      if (
        currentURLRef?.current?.includes('welcome/success') ||
        currentURLRef?.current?.includes('welcome/bookclasseswithclasspack') ||
        currentURLRef?.current?.includes('my-schedule')
      ) {
        setURL(storeURL);
      }
      if (routeData?.isMainRoute) {
        if (routeData?.currentRoute != 'home') {
          setURL(storeURL);
        } else {
          return false;
        }
      }

      if (lastUrl?.includes('welcome/success')) {
        return false;
      } else {
        webView?.current?.goBack();
        return true;
      }

      return true; // prevent default behavior (exit app)
    }
    return false;
  };

  const handleRouteChange = (currentUrl: string) => {
    const routeData = getCurrentRouteData(currentUrl);
    console.log('routeData---------', routeData, currentRoute);

    if (timeoutId) {
      // Clear the existing timer if it exists
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(
      () => {
        setShowMenu(routeData?.isMainRoute);
        console.log('setIsMainRoute', routeData?.isMainRoute);
        dispatch(setIsMainRoute(routeData?.isMainRoute));
        dispatch(setCurrentRoute(routeData?.currentRoute));
        webView?.current?.injectJavaScript(JAVASCRIPT_TO_INJECT);
      },
      routeData?.currentRoute === 'subRoute'
        ? 500
        : currentRoute == 'subRoute' || currentRoute == 'my-schedule'
        ? 500
        : 0,
    );

    setTimeoutId(newTimeoutId);
  };

  const resetWebView = () => {
    CookieManager.clearAll().then((success: any) => {
      console.log('CookieManager.clearAll =>', success);
    });
  };

  const handleLogout = async () => {
    const isMultiLocation = businessDetails?.subdomainData?.isMultiLocationBusiness;
    showMessage(shortInfoFlashMessage(themeColors, 'Please login to continue'));

    dispatch(setLoading(false));
    dispatch(userLogOut());
    dispatch(setWebViewCookies(''));

    setIsLogged(false);
    resetWebView();
    if (isMultiLocation) {
      dispatch(setServiceStoreURL(brandedConstants?.Constants?.storeURL));
      dispatch(
        fetchBusinessDetails(
         brandedConstants?.Constants?.storeURL
        ),
      );
    }
    await firebase.messaging().deleteToken();

    setTimeout(
      () => {
        navigation?.navigate(Constants.loginRoute);
      },
      isMultiLocation ? 500 : 0,
    );

  };

  const handleNavigationStateChange = (newNavState: any) => {
    const {loading, url} = newNavState;
    if (!url) return;
    if (loading) return;

    console.log('url changed', url, loading);
    dispatch(setLoading(false));
    setCurrentUrl(url);
    setLastUrl(currentUrl);
    const routeData = getCurrentRouteData(url);
    if (url?.includes('service-details')) {
      handleRouteChange(url);
    }

    // handleRouteChange(url);
    setTimeout(() => {
      webView?.current?.injectJavaScript(JAVASCRIPT_TO_INJECT);
    }, 500);
  };

  const handleLoadWithRequest = (request: any) => {
    const {url} = request;

    console.log(
      'url-================',
      brandedConstants?.Constants?.storeURL,
      url,
      storeURL,
    );
    const routeData = getCurrentRouteData(url);

    if (businessDetails?.subdomainData?.isMultiLocationBusiness) {
      multiLocationDomains?.map((item: any) => {
        // console.log(
        //   'first',
        //   !url?.includes(storeURL),
        //   url?.includes(item?.url),
        //   !item?.isMaster,
        // );
        if (!url?.includes(storeURL) && url?.includes(item?.url)) {
          setStoreURL(item?.url);
          dispatch(setServiceStoreURL(item?.url));
          dispatch(fetchBusinessDetails(item?.url));

          if (!item?.isMaster && !url?.includes('auth/login')) {
            // resetWebView();
            setCookies(url);
          }
        }
      });

      // setWebViewKey(webViewKey + 1);
    }

    if (
      url?.includes('welcome/logout') ||
      url?.includes('auth/login?redirect')
    ) {
      handleLogout();
      return false;
    }

    console.log('urlhandler----------------', url);
    if (routeData?.isMainRoute == false) {
      if (
        url != 'about:blank' &&
        !url?.includes('service-details?') &&
        !url.includes('maps/embed/v1/place?') &&
        !url.includes('js.stripe.com') &&
        !url.includes('youtube.com') &&
        !url.includes('welcome')
      ) {
        dispatch(setLoading(true));
      }
    } else {
      if (isInitialLoad) {
        setURL(addQueryParam(url, Constants.webViewQueryParam));
        if (url) setIsInitialLoad(false);

        return false;
      }

      if (
        routeData?.currentRoute == 'home' &&
        !url?.includes('isWebView=true')
      ) {
        let newURL = addQueryParam(url, Constants.webViewQueryParam);
        console.log('newURL', newURL);
        const script = `window.location.href = '${newURL}'`;
        webView?.current?.injectJavaScript(script);
        return false;
      }
    }

    if (
      url.startsWith('tel:') ||
      url.startsWith('mailto:') ||
      url.startsWith('https://www.facebook.com') ||
      url.startsWith('https://api.whatsapp.com') ||
      url.startsWith('https://www.linkedin.com') ||
      url.startsWith('https://twitter.com') ||
      url.startsWith('instagram:') ||
      url.startsWith('https://play.google') ||
      url.startsWith('https://apps.apple')
    ) {
      dispatch(setLoading(false));
      Linking?.openURL(url).catch(er => {
        Alert.alert('Failed to open Link: ' + er.message);
      });
      return false;
    }

    return true;
  };
  const onLoad = () => {
    dispatch(setLoading(false));
  };

  const onErrorWhileLoading = () => {
    //Reset cache & cookies here
    setHideWebView(true);
  };

  const setCookies = (url: String = '') => {
    if (!webViewCookies || webViewCookies == '') {
      return;
    }

    let cookiesArray = JSON.parse(webViewCookies);

    CookieManager.clearAll().then((success: any) => {
      console.log('CookieManager.clearAll before set =>', success);
      cookiesArray?.forEach((cookieObject: any) => {
        // const [name, value] = cookieString?.split('=');
        // const cookie = createCookieFromObject(cookieObject);

        // console.log('fetched cookie', cookieObject);

        // console.log(
        //   'domaindomaindomaindomaindomaindomaindomain',
        //   cookieObject.name,
        //   cookieObject.name == ' omnify-multi-token',
        //   cookieObject.name == ' first-bid',
        // );
        if (
          cookieObject.name == Constants?.multiToken ||
          cookieObject.name == Constants?.firstBID
        ) {
          // alert('hih');
          // console.log('domaindomaindomaindomaindomaindomaindomainstoreURL', storeURL);
          CookieManager.get(storeURL).then(cookies => {
            console.log('cookies on special', JSON.stringify(cookies));
            if (cookies['omnify-multi-token'] || cookies['first-bid']) {
              // alert('urls?.appDomainHost------- if  '+ urls?.appDomainHost)
              console.log('cookies', cookies['omnify-multi-token']);
            } else {
              console.log('urls?.appDomainHost-------', urls?.appDomainHost);
              CookieManager.set(urls?.appDomainHost, {
                name: cookieObject.name,
                value: cookieObject.value,
                domain: urls?.appDomainName,
                path: '/',
                version: '1',
                expires: cookieObject.expires,
              }).then(done => {
                console.log('CookieManager.set special =>', done);
              });
            }
          });
        } else {
          // if(url){
          //   console.log('url----', url);
          //   cookieObject.domain = url  ;
          // }

          try {
            CookieManager.set(
              url?.length > 0 ? url : route?.route?.params?.serviceStoreURL,
              cookieObject,
              true,
            ).then(res => {
              console.log('CookieManager.set from webkit-view =>', res);
            });
          } catch (error) {
            console.log('error---', error);
          }
        }
      });
    });

    // webView?.current?.injectJavaScript(setCookiesScript);
  };

  //Check if the token still exists in cookies and set it if it is not
  const checkAuthState = async () => {
    if (token != null) {
      //Check if user is logged in
      await CookieManager.get(url).then(cookies => {
        // console.log('cookies', JSON.stringify(cookies));
        if (cookies[Constants?.authToken]) {
        } else {
          setCookies();
        }
      });
    }
  };

  const onMessage = (event: any) => {
    const {data} = event.nativeEvent;
    console.log('data', event.nativeEvent);
    if (data == Constants?.fullScreenModalOpened) {
      setShowMenu(false);
      dispatch(setIsMainRoute(false));
      // console.log('dispatched onmesage ;;;;;;;;;;;;;;;;;;;;;;', false)
    } else if (data == Constants?.fullScreenModalClosed) {
      setShowMenu(true);
      dispatch(setIsMainRoute(true));
    }
    if (data == 'openedLoginModal' || data == 'userLoggedOut') {
      handleLogout();
    }
  };

  const backPress = () => {
    if (currentUrl.includes('welcome/success')) {
      setURL(storeURL);
    } else {
      if (isUrlSetByNotification) {
        setURL(brandedConstants?.Constants?.storeURL);
        setIsUrlSetByNotification(false);
      } else {
        // webView?.current?.goBack();
        // setWebViewKey(webViewKey + 1)
        setURL(storeURL);
      }
    }
  };

  const handleNavBarPressAction = (action: any) => {
    switch (action) {
      case 'myAccount':
        dispatch(setLoading(true));
        setURL(storeURL + '/account/');

        setWebViewKey(webViewKey + 1);
        break;

      case 'logOut':
        setURL(storeURL + '/welcome/logout');
        setWebViewKey(webViewKey + 1);

        break;
    }
  };

  const changeRoute = async (newRoute: string) => {
    if (newRoute == 'profile') {
      let isloggedIn = false;

      //Check if user is logged in
      await CookieManager.get(url).then(cookies => {
        console.log('cookies', JSON.stringify(cookies));
      });

      if (token != null) {
        isloggedIn = true;
        setIsLogged(true);
        setURL(storeURL + '/' + 'my-schedule');

        setWebViewKey(webViewKey + 1);
      } else {
        handleLogout();
      }
      // console.log('isloggedIn', isloggedIn);
    } else {
      webView?.current?.injectJavaScript(redirectScript(newRoute, menuData));
      handleRouteChange(`/${newRoute}`);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkAuthState();
        setTimeout(() => {
          processNotification();
        }, 1000);
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    });

    // const notificationOpenedListener = messaging().onNotificationOpenedApp(
    //   remoteMessage => {
    //     console.log('Notification caused app to open from background state:');

    //     // processNotification();
    //   },
    // );

    return () => {
      subscription?.remove();
      // notificationOpenedListener();
    };
  }, []);

  const processNotification = async () => {
    let openViaNotification = JSON.parse(
      await AsyncValues.getItem(Strings.openWithNotification),
    );
    console.log('openViaNotification', openViaNotification);
    if (openViaNotification) {
      setIsUrlSetByNotification(true);

      dispatch(setLoading(true));

      setTimeout(() => {
        dispatch(setLoading(false));
      }, 200);
      let notificationData = await createDataFromNotification(storeURL);

      // dispatch(setAppOpenedViaNotification(!notificationData?.isMainRoute));
      setTimeout(() => {
        // console.log('go to URL---', notificationData?.initialURL);

        setURL(notificationData?.initialURL);
      }, 200);
    }
  };

  // useEffects:

  const getFirebaseToken = async () => {
    const token = await messaging().getToken();
    setFCMToken(token);
    console.log('fcm_token', token);
  };

  useEffect(() => {
    // console.log('openedViaNotification on uueseefect', openedViaNotification);
    processNotification();

    if (openedViaNotification) {
      dispatch(setAppOpenedViaNotification(false));
      setIsUrlSetByNotification(true);
    }
  }, [openedViaNotification]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
    };
  }, []);

  useEffect(() => {
    getFirebaseToken();

    token != null && setCookies();

    setCurrentUrl(url);
  }, []);

  useEffect(() => {
    if (currentUrl == Constants.blankPage) {
      return;
    }
    currentURLRef.current = currentUrl;
  }, [currentUrl]);

  // useEffect(() => {
  // console.log('storeURL----------------------', storeURL)
  // }, [storeURL])

  return (
    <View style={style.container}>
      <NavHeader
        backPress={backPress}
        showMenu={showMenu}
        pressAction={(action: any) => handleNavBarPressAction(action)}
      />

      {!hideWebView ? (
        <WebView
          ref={webView}
          key={webViewKey}
          // forceDarkOn={true}
          onMessage={onMessage}
          style={[
            style.webview,
            showMenu && currentRoute != 'schedules' && {marginTop: 0},
          ]}
          contextMenuHidden={true}
          pullToRefreshEnabled
          source={{
            uri: url,
          }}
          injectedJavaScriptForMainFrameOnly={false}
          // injectedJavaScriptBeforeContentLoaded={jsCode}
          injectedJavaScript={JAVASCRIPT_TO_INJECT}
          // onMessage={event => {}}

          cacheEnabled={true}
          javaScriptEnabled
          domStorageEnabled
          scalesPageToFit={false}
          nestedScrollEnabled
          setSupportMultipleWindows={false}
          javaScriptCanOpenWindowsAutomatically={false}
          bounces
          // onScroll={e => console.log('scroll', e)}
          onLoad={onLoad}
          onLoadStart={syntheticEvent => {
            // dispatch(setLoading(true));
            const {nativeEvent} = syntheticEvent;

            handleRouteChange(nativeEvent?.url);
          }}
          onLoadEnd={() => onLoad()}
          onError={() => onErrorWhileLoading()}
          // userAgent={Strings.userAgent}
          onShouldStartLoadWithRequest={handleLoadWithRequest}
          onNavigationStateChange={handleNavigationStateChange}
          // renderLoading={Spinner()}
          decelerationRate="normal"
          thirdPartyCookiesEnabled
          userAgent={`Service-Store-App-${fcmToken}`}
          sharedCookiesEnabled
          originWhitelist={['*']}
          webviewDebuggingEnabled
        />
      ) : (
        <View style={style.errorContainer}>
          <Text style={style.errorText}>{Strings.WebViewError}</Text>
          <View style={style.btnContainer}>
            <TouchableOpacity
              style={style.retryBtn}
              activeOpacity={0.5}
              onPress={resetWebView}>
              <Text style={style.retryBtnTxt}>{Strings.retry}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <BottomMenu
        showMenu={showMenu}
        changeCurrentRoute={(route: string) => changeRoute(route)}
      />
      <FullScreenSpinner
        isLoading={isLoading}
        transparent={true}
        color={themeColors?.buttonColor}
        loaderStyle={{}}
      />
    </View>
  );
};

export default Home;
