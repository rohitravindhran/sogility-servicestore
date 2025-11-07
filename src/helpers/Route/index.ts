import StaticVariables from "../../preference/StaticVariables";

const getCurrentRouteData = (currentUrl: String) => {
  let isMainRoute = false;
  let currentRoute = 'subRoute';

  for (const route of StaticVariables?.BOTTOM_MENU) {
    if (currentUrl.includes(`/${route.route}`)) {
      currentRoute = route.route;
      isMainRoute = true;
      break; // Exit the loop once a main route is found
    }
  }

  if (!isMainRoute) {
    if (
      currentUrl.includes('my-subscriptions') ||
      currentUrl.includes('transactions') ||
      currentUrl.includes('family') ||
      currentUrl.includes('my-schedule')
    ) {
      currentRoute = 'my-schedule';
    } else if (currentUrl.includes('invoice') || currentUrl.includes('service-details')  || currentUrl.includes('categories')) {
      currentRoute = 'innerRoute';
    }
  }

  return {
    isMainRoute,
    currentRoute,
  };
};

export default getCurrentRouteData;
