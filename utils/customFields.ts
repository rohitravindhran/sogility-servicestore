// Custom Fields utility functions for the signup flow

export const makeCustomFieldDataForApi = (
  customFields: any[],
  formValues: any[],
) => {
  let customFieldsData: any = {};

  customFields?.forEach((item: any, index: number) => {
    const value = formValues[index]?.value;
    
    if (item?.label_type === 'date' && value) {
      // Convert Date object to string format
      customFieldsData[`${item?.id}_`] = getDateStringFromDate(value);
    } else {
      customFieldsData[`${item?.id}_`] = value;
    }
  });

  return customFieldsData;
};

export const getInitValues = (data: any[]) => {
  let formDataInit: any = [];
  
  data?.forEach((item: any, index: number) => {
    let valueData = {
      value: getDefaultValue(item?.label_type),
      type: item?.label_type,
      showComponent: false,
      error: false,
    };
    formDataInit[index] = valueData;
  });

  return formDataInit;
};

export const getDefaultValue = (type: string) => {
  switch (type) {
    case 'text':
    case 'number':
      return '';
    case 'date':
      return null;
    case 'select':
    case 'multiselect':
      return [];
    case 'checkbox':
      return false;
    default:
      return '';
  }
};

export const checkIsEmpty = (type: string, value: any): boolean => {
  switch (type) {
    case 'text':
    case 'number':
      return !value || value === '';
    case 'date':
      return value === null || value === undefined || value === '';
    case 'select':
    case 'multiselect':
      return !value || value.length === 0;
    case 'checkbox':
      return !value;
    default:
      return true;
  }
};

export const getErrorMessage = (item: any) => {
  const type = item?.label_type;
  const name = item?.label_name?.toLowerCase();

  switch (type) {
    case 'text':
    case 'number':
    case 'date':
      return `Please enter ${name}`;
    case 'select':
    case 'multiselect':
      return `Please select ${name}`;
    case 'checkbox':
      return `Please check this box`;
    default:
      return `Please fill ${name}`;
  }
};

export const makePickerArray = (data: any[]) => {
  const pickerArray: any[] = [];
  
  data?.forEach((item: any) => {
    pickerArray.push({
      label: item?.text,
      value: item?.text
    });
  });

  return pickerArray;
};

export const getDateStringFromDate = (date: Date | string): string => {
  if (!date) return '';
  
  // If it's already a string in YYYY-MM-DD format, return it
  if (typeof date === 'string') {
    return date;
  }
  
  // If it's a Date object, convert it
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  // If it's neither, try to create a Date object from it
  try {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error converting date:', error);
  }
  
  return '';
};

export const getDateString = (date: Date | null): string => {
  if (!date) return 'Select date';
  
  return date.toLocaleDateString();
};