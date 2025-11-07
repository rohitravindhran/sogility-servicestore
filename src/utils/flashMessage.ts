import {GlobalStyles} from '@utils/GlobalStyles';
import {MessageOptions} from 'react-native-flash-message';

export const shortSuccessFlashMessage = (
  themeColors: any,
  title: any,
): MessageOptions => {
  return {
    message: title,
    type: 'success',
    icon: 'success',
    duration: 2000,
    style: GlobalStyles(themeColors).flashMessage,
  };
};

export const shortInfoFlashMessage = (
  themeColors: any,
  title: any,
): MessageOptions => {
  return {
    message: title,
    type: 'info',
    icon: 'info',
    duration: 2000,
    style: GlobalStyles(themeColors).flashMessage,
    
  };
};

export const shortErrorFlashMessage = (
  themeColors: any,
  title: any,
): MessageOptions => {
  return {
    message: title,
    type: 'danger',
    icon: 'danger',
    duration: 2000,
    style: GlobalStyles(themeColors).flashMessage,
    
  };
};
