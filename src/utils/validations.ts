
import * as yup from 'yup';
import PhoneNumber from 'libphonenumber-js';

export const phoneSchema = (countryCode:any) => {
  return yup
    .string()
    .test('is-valid-phone', 'Invalid phone number', (value) => {
        console.log('countryCode', value,countryCode)
      const phoneNumber = PhoneNumber(value, countryCode);
      return phoneNumber?.isValid();
    });
};

