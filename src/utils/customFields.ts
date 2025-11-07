import { getDateStringFromDate } from "@helpers/Date";

export const makeCustomFieldDataForApi = (
  customFields: any,
  formValues: any,
) => {
  let customFieldsData: any = {};

  customFields?.map((item: any, index: number) => {
    customFieldsData[`${item?.id}_`] = item?.label_type == 'date' ? getDateStringFromDate(formValues[index]?.value) : formValues[index]?.value ;
  });

  return customFieldsData;
};

export const getInitValues = (data: any) => {
  // formDataInit[index] = valueData;

  let formDataInit: any = [];
  data?.map((item: any, index: number) => {
    let valueData = {
      value: getDefaultValue(item?.label_type),
      type: item?.label_type,
      showComponent: false,
    };

    formDataInit[index] = valueData;
  });

  return formDataInit;
};

export const getDefaultValue = (type: any) => {
  if (type == 'text') {
    return '';
  } else if (type == 'number') {
    return '';
  } else if (type == 'date') {
    return null;
  } else if (type == 'select') {
    return [];
  } else if (type == 'multiselect') {
    return [];
  } else if (type == 'checkbox') {
    return false;
  }
};

export const checkIsEmpty = (type: any, value: any): boolean => {
  if (type == 'text') {
    return value == '';
  } else if (type == 'number') {
    return value == '';
  } else if (type == 'date') {
    return value == null;
  } else if (type == 'select') {
    return value?.length == 0;
  } else if (type == 'multiselect') {
    return value?.length == 0;
  } else if (type == 'checkbox') {
    return !value;
  }
  return true;
};
export const getErrorMessage = (item: any) => {
  const type = item?.label_type;
  const name = item?.label_name?.toLowerCase();

  if (type == 'text') {
    return `Please enter ${name}`;
  } else if (type == 'number') {
    return `Please enter ${name}`;
  } else if (type == 'date') {
    return `Please enter ${name}`;
  } else if (type == 'select') {
    return `Please select ${name}`;
  } else if (type == 'multiselect') {
    return `Please select ${name}`;
  } else if (type == 'checkbox') {
    return `Please tick this box`;
  }
};
