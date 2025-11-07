import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const LocationAccess = Platform.select({
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
});

export const CameraAccess = Platform.select({
  android: PERMISSIONS.ANDROID.CAMERA,
  ios: PERMISSIONS.IOS.CAMERA,
});

export const MediaAccess = Platform.select({
  android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
});

export const StorageAccess = Platform.select({
  android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
});

export const CheckPermission = (permission: string): Promise<string | typeof RESULTS> => {
  return new Promise((resolve, reject) => {
    check(permission)
      .then(result => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            resolve(RESULTS.UNAVAILABLE);
            break;
          case RESULTS.DENIED:
            RequestPermission(permission)
              .then(message => {
                resolve(message);
              })
              .catch(message => {
                reject(message);
              });
            break;
          case RESULTS.GRANTED:
            resolve(RESULTS.GRANTED);
            break;
          case RESULTS.BLOCKED:
            reject(RESULTS.BLOCKED);
            break;
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const RequestPermission = (permission: string): Promise<string | typeof RESULTS> => {
  return new Promise((resolve, reject) => {
    request(permission)
      .then(result => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            resolve(RESULTS.UNAVAILABLE);
            break;
          case RESULTS.DENIED:
            reject(RESULTS.DENIED);
            break;
          case RESULTS.GRANTED:
            resolve(RESULTS.GRANTED);
            break;
          case RESULTS.BLOCKED:
            reject(RESULTS.BLOCKED);
            break;
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};
