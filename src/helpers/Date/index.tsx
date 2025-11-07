import moment from 'moment';

export const processDate = (dd: moment.Moment): string => {
  const dateString =
    dd.get('date') < 10
      ? `0${dd.get('date')}`
      : `${dd.get('date')} ${months[dd.get('month')]} ${dd.get('year')}`;
  return dateString;
};

export const processTime = (dd: moment.Moment): string => {
  const timeString =
    dd.get('hour') < 10
      ? `0${dd.get('hour')}`
      : `${dd.get('hour')}:${dd.get('minute') < 10 ? `0${dd.get('minute')}` : dd.get('minute')} `;
  return timeString;
};

export const getDateFromTimestamp = (date: string): string => {
  const momentObj = moment(date, 'YYYY-MM-DD hh:mm:ss');
  const showDate = moment(momentObj).format('DD MMM YYYY');
  return showDate;
};

export const getCurrentTimeStamp = (): string => {
  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  const dateTime = `${date} ${time}`;
  return dateTime;
};

export const getDateString = (currentDate:Date): string => {

  if(!currentDate){
    return '';
  }
 // Get day, month, and year from the Date object
 const day = currentDate?.getDate().toString().padStart(2, '0'); // Zero-padding if needed
 const month = (currentDate?.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
 const year = currentDate?.getFullYear();

 // Format the date as "dd-mm-yyyy"
 const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};





export const getDateStringFromDate = (dd: Date): string => {
  if(!dd){
    return '';
  }
  const date = moment(dd).format('DD MMM YYYY');
  return date.toString();
};

export const convertToUppercase = (dd: string | undefined): string => {
  const cDate = dd?.toUpperCase() || '';
  return cDate.toString();
};

export const convertDateToUppercase = (dd: string | undefined): string => {
  const cDate = dd?.replace('am', 'AM') || '';
  return cDate;
};

export const getCurrentDateInURLFormat = (): string => {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');
  
  const formattedDate = `${year}-${month}-${day}`;
  console.log(formattedDate);
return formattedDate;
};



