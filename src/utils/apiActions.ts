export function addHeader(options: any = {}, token: String) {
    const newOptions = {...options};
    if (!options.headers) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      };
    }
  
    if (token && token != '') {
      newOptions.headers.Authorization = `Bearer ${token}`;
    }
  
    return newOptions;
  }