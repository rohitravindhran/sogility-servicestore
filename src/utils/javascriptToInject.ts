import StaticVariables from 'src/preference/StaticVariables';

export const JAVASCRIPT_TO_INJECT = 
`var viewport = document?.querySelector('meta[name=viewport]');
viewport?.setAttribute(
  'content',
  'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
);

if (document?.querySelector('.schedules-top-bar--bc3--bw1')) {
  document.querySelector('.schedules-top-bar--bc3--bw1').style.top = '0px';
}
if (document?.querySelector('.navbar-wrapper')) {
  document.querySelector('.navbar-wrapper').style.display = 'none';
}
if (document?.querySelector('.ss-footer')) {
  document.querySelector('.ss-footer').style.display = 'none';
}
if (document?.querySelector('.body-text-2-regular')) {
  document.querySelector('.body-text-2-regular').textContent = '';
}


function handleModalOpened() {
  window.ReactNativeWebView.postMessage('openedModal');
  setTimeout(() => {
    const ssCardClose = document?.getElementById('default-close');
    const intoVideoClose = document?.querySelector('.intro-video-close-btn');
    if (ssCardClose) {
      ssCardClose.addEventListener('click', () => {
        window.ReactNativeWebView.postMessage('closedModal');
      });
    }
    if (intoVideoClose) {
      intoVideoClose.addEventListener('click', () => {
        window.ReactNativeWebView.postMessage('closedModal');
      });
    }
  }, 1000);
}

// Function to set up a MutationObserver to detect changes in the DOM
function setupModalObserver() {
  const targetNode = document.body;

  const config = {childList: true, subtree: true};

  // Callback function when changes are detected
  const callback = function (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes) {
        for (const node of mutation.addedNodes) {
      
          if (node.querySelector('.ss-auth-modal-form-wrapper')) {
            window.ReactNativeWebView.postMessage('openedLoginModal');
            document.querySelector('.ss-overlay-bg').style.display = 'none';

           return;
          }
          if (node.querySelector('.navbar-wrapper')) {
            document.querySelector('.navbar-wrapper').style.display = 'none';
            return;
          }
          if (node.querySelector('.schedules-top-bar--bc3--bw1')) {
            document.querySelector('.schedules-top-bar--bc3--bw1').style.top =
              '0px';
            return;
          }
  
        }
      }
    }
  };

  const observer = new MutationObserver(callback);

  observer.observe(targetNode, config);
}

window.addEventListener('load', setupModalObserver);
true;`

export const redirectScript = (route: String,menuData:any) => {
  const routeIndex = menuData?.findIndex(
    (item:any) => item.route == route,
  );

  console.log('route-----', JSON.stringify(route));
  console.log('routeIndex', `navigateTo${route}?isWebView=true`);

  return `
  window.postMessage("navigateTo${route}?isWebView=true","*");
`;
};
