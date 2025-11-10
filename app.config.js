// This configuration file allows us to use environment variables in app.json
// Expo will use this file instead of app.json when present
export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      EXPO_PUBLIC_APP_DOMAIN_NAME: process.env.EXPO_PUBLIC_APP_DOMAIN_NAME || '.omnifyapp.com',
      EXPO_PUBLIC_APP_DOMAIN_HOST: process.env.EXPO_PUBLIC_APP_DOMAIN_HOST || 'https://app.omnifyapp.com',
      EXPO_PUBLIC_BASE_URL_API: process.env.EXPO_PUBLIC_BASE_URL_API || 'https://api.omnifyapp.com/',
      EXPO_PUBLIC_BASE_URL_APP: process.env.EXPO_PUBLIC_BASE_URL_APP || 'https://app.omnifyapp.com/',
    },
  };
};