import { urls } from "@constants/Url";

export function getCookieArrayFromHeader(
  setCookieHeader: any,
  storeURL: string,
  isMultiLocation:boolean
) {
  const cookiesArray = setCookieHeader.split(
    /,\s*(?=\w+=|\snext-auth.session-token=|\somnify-multi-token=|\sfirst-bid=)/,
    );

  const cookieObjects = [];

  // Loop through the cookies to find the specific tokens
  let sessionTokenExists = false;
  let omnifyToken = '';
  console.log('cookiesArray;;;;;;;;;;;;;;;;;;;;;;;;;;;;', setCookieHeader);
  for (const cookie of cookiesArray) {
    console.log('cookieName', cookie);

    const [nameValue, ...attributes] = cookie?.split(/;\s*/);
    const [name, value] = nameValue?.split('=');

    // Initialize an object to store the cookie attributes
    const cookieObject: any = {name, value};

    // Extract and parse each cookie attribute
    attributes.forEach((attribute: any) => {
      const [key, val] = attribute.split('=');
      cookieObject[key] = val ? val : true; // Set to true if no value is specified
    });

    const trimmedCookieName = name?.trim();
    console.log('ismultitoken--------', trimmedCookieName);

    if (
      trimmedCookieName === 'omnify-token' ||
      trimmedCookieName === 'next-auth.session-token' ||
      trimmedCookieName === 'authautologin'
    ) {
      if (trimmedCookieName === 'omnify-token') {
        sessionTokenExists = true;
        omnifyToken = value;
      }

      // const cookieObject = {
      //   name: trimmedCookieName,
      //   value: cookieValue,
      //   domain: storeURL,
      //   path: '/',
      //   expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Expires in 60 days
      //   version: 1,
      // };

      cookieObjects.push(cookieObject);
    }


    if(isMultiLocation) {
      if (
        trimmedCookieName === 'omnify-multi-token' ||
        trimmedCookieName === 'first-bid' 
      ) {
        console.log('multitoken---------------------------------',cookieObject);
        cookieObject.domain = urls?.appDomainName;  

        cookieObjects.push(cookieObject);
      }
    }
  }

  return {cookieObjects, sessionTokenExists, omnifyToken};
}

export function getCookieArrayFromString(cookies: any) {}

export function createCookieFromObject(cookieObject: any) {
  const {name, value, domain, path, expires, version} = cookieObject;


  // let cookieDomain = domain?.includes('https://')
  //   ? domain
  //   : `https://${domain}`;

  let cookieDomain = domain?.includes('https://')
    ? domain.replace('https://', '')
    : domain;

  const cookieOptions = {
    name,
    value,
    cookieDomain,
    path,
    expires,
    version,
  };

  return cookieOptions;
}
