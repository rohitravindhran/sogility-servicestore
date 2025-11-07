import {useNavigation} from '@react-navigation/native';
import {AsyncValues} from '../../constants/AsyncStorage';
import {Strings} from '../../constants/Strings';
import {showMessage, hideMessage} from 'react-native-flash-message';

export const refreshAccessToken = async () => {
  //Force logout user and redirect to login screen

  AsyncValues.clearItems();

  showMessage({
    message: 'Please login',
    type: 'success',
    icon: 'success',
    floating: true,
    duration: 3000,
  });
};
