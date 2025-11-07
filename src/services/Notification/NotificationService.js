import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import {Platform} from 'react-native';
import {AsyncValues} from '../../constants/AsyncStorage';
import {Strings} from '../../constants/Strings';

export const handleForegroundEvent = async ({type, detail}) => {
  if (type === 1) {
    AsyncValues.setItem(Strings.openWithNotification, JSON.stringify(true));
  }
};

export const handleBackgroundEvent = async ({type, detail}) => {
  if (type === 1) {
    AsyncValues.setItem(Strings.openWithNotification, JSON.stringify(true));
  }
};

export const handleNotificationOpenedApp = async remoteMessage => {
  AsyncValues.setItem(
    Strings.notificationTarget,
    remoteMessage.data?.notification_target,
  );
  AsyncValues.setItem(
    Strings.notificationData,
    JSON.stringify(remoteMessage.data?.notification_data),
  );
  AsyncValues.setItem(Strings.openWithNotification, JSON.stringify(true));
};

export const handleInitialNotification = async () => {
  const remoteMessage = await messaging().getInitialNotification();
  if (remoteMessage) {
    console.log(
      'Notification caused app to open from quit state:',
      remoteMessage,
    );
    AsyncValues.setItem(
      Strings.notificationTarget,
      remoteMessage.data?.notification_target,
    );
    AsyncValues.setItem(
      Strings.notificationData,
      JSON.stringify(remoteMessage.data?.notification_data),
    );
    AsyncValues.setItem(Strings.openWithNotification, JSON.stringify(true));
  }
};

export const showNotification = remoteMessage => {
  // console.log('first--++-', remoteMessage);

  AsyncValues.setItem(
    Strings.notificationTarget,
    remoteMessage.data?.notification_target,
  );
  AsyncValues.setItem(
    Strings.notificationData,
    JSON.stringify(remoteMessage.data?.notification_data),
  );
};

export const displayNotification = remoteMessage => {
  notifee.displayNotification({
    title: remoteMessage.notification?.title,
    body: remoteMessage.notification?.body,
    android: {
      channelId: 'default',
      pressAction: {
        id: 'default',
      },
      smallIcon: 'small_icon',
      color: '#33d16b',
    },
  });
};

export const setupNotificationListeners = () => {
  messaging().onMessage(async remoteMessage => {
    console.log('first---');
    console.log('notification received ',remoteMessage);

    // if (Platform.OS == Strings.androidOS) {

    //Check the if it is a duplicate notification

    if (!openByNotification) {
      //Check the user id if the notification is  general or targeted

      if (remoteMessage.data?.notification_target == Strings.home) {
        showNotification(remoteMessage);
      } else {
        console.log('first---', remoteMessage.data?.user_id, userId);

        if (
          remoteMessage.data?.user_id?.toLowerCase() == userId?.toLowerCase()
        ) {
          showNotification(remoteMessage);
          displayNotification(remoteMessage);

          console.log('first--+-', remoteMessage);
        }
      }
    }
    // }
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    //Handle background notification in Android

    //Check the user id if the notification is  general or targeted
    console.log('notification received',remoteMessage);

    if (remoteMessage?.data?.notification_target == Strings.home) {
      showNotification(remoteMessage);
    } else {
      if (remoteMessage.data?.user_id == userId) {
        showNotification(remoteMessage);
        // displayNotification(remoteMessage);
      }
    }
  });

  notifee.onBackgroundEvent(handleBackgroundEvent);
  notifee.onForegroundEvent(handleForegroundEvent);

  messaging().onNotificationOpenedApp(handleNotificationOpenedApp);

  handleInitialNotification();
};

export default setupNotificationListeners;
