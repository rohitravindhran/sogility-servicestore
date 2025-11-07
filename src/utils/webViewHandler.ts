export function addQueryParam(url: string, queryParam: string) {
  let newURL = url;
  if (url?.includes('?')) {
    newURL = newURL + '&' + queryParam;
  } else {
    newURL = newURL + '?' + queryParam;
  }

  return newURL;
}
