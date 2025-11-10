// Route detection utility based on the original implementation

interface RouteData {
  isMainRoute: boolean;
  currentRoute: string;
  showHeader: boolean;
  showBackButton: boolean;
  showBottomMenu: boolean;
}

// Define the main routes that should show the bottom menu
const MAIN_ROUTES = ['home', 'schedules', 'subscriptions', 'profile'];

export const getRouteData = (currentUrl: string): RouteData => {
  let isMainRoute = false;
  let currentRoute = 'subRoute';
  let showHeader = false;
  let showBackButton = false;
  let showBottomMenu = false;

  // Check if current URL matches any main route
  for (const route of MAIN_ROUTES) {
    if (currentUrl.includes(`/${route}`) || (route === 'home' && currentUrl.includes('/home'))) {
      currentRoute = route;
      isMainRoute = true;
      break;
    }
  }

  // Special handling for specific routes based on original logic
  if (!isMainRoute) {
    if (
      currentUrl.includes('my-subscriptions') ||
      currentUrl.includes('transactions') ||
      currentUrl.includes('family') ||
      currentUrl.includes('my-schedule')
    ) {
      currentRoute = 'my-schedule';
      showBackButton = false;
    } else if (
      currentUrl.includes('invoice') || 
      currentUrl.includes('service-details') || 
      currentUrl.includes('categories') ||
      currentUrl.includes('checkout') ||
      currentUrl.includes('classpack') ||
      currentUrl.includes('reviewbooking') ||
      currentUrl.includes('welcome/success') ||
      currentUrl.includes('welcome/failure') ||
      currentUrl.includes('payment') ||
      currentUrl.includes('billing')
    ) {
      currentRoute = 'innerRoute';
      showBackButton = false;
    } else {
      currentRoute = 'subRoute';
      showBackButton = false;
    }
  }

  // Special case: Hide header and bottom menu for profile pages
  try {
    const urlObj = new URL(currentUrl);
    if (urlObj.pathname.startsWith('/profile/')) {
      console.log('Profile page detected - hiding header and bottom menu');
      showHeader = false;
      showBackButton = false;
      showBottomMenu = false;
      return {
        isMainRoute: false,
        currentRoute: 'profile',
        showHeader,
        showBackButton,
        showBottomMenu,
      };
    }
  } catch (error) {
    console.error('Error parsing URL for profile check:', error);
  }

  // Determine header visibility - based on original logic
  if (isMainRoute) {
    // Show header for main routes except schedules and my-schedule
    if (currentRoute !== 'schedules' && currentRoute !== 'my-schedule') {
      showHeader = true;
    }
    showBottomMenu = true;
  } else {
    // For sub-routes, hide header completely for inner routes  
    if (currentRoute === 'innerRoute') {
      showHeader = false;
      showBackButton = false;
    }
    // Bottom menu should NOT be shown for sub-routes (including checkout/classpack pages)
    showBottomMenu = false;
  }

  return {
    isMainRoute,
    currentRoute,
    showHeader,
    showBackButton,
    showBottomMenu,
  };
};

// JavaScript injection for WebView - based on original implementation
export const WEBVIEW_INJECTION_SCRIPT = `
var viewport = document?.querySelector('meta[name=viewport]');
viewport?.setAttribute(
  'content',
  'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
);

// Hide web header, footer, and navigation elements
function hideWebElements() {
  // Check if this is a checkout/payment/booking page
  const isPaymentPage = window.location.href.includes('checkout') || 
                        window.location.href.includes('payment') ||
                        window.location.href.includes('stripe') ||
                        window.location.href.includes('reviewbooking') ||
                        window.location.href.includes('welcome/success') ||
                        window.location.href.includes('welcome/failure');
  
  if (isPaymentPage) {
    console.log('Payment/booking page detected - using minimal element hiding');
    // Only hide essential navigation elements on payment/booking pages
    const navbar = document?.querySelector('.navbar-wrapper');
    if (navbar) {
      navbar.style.display = 'none';
    }
    const footer = document?.querySelector('.ss-footer');
    if (footer) {
      footer.style.display = 'none';
    }
    return;
  }

  // Hide top bar
  const topBar = document?.querySelector('.schedules-top-bar--bc3--bw1');
  if (topBar) {
    topBar.style.top = '0px';
  }
  
  // Hide navbar wrapper
  const navbar = document?.querySelector('.navbar-wrapper');
  if (navbar) {
    navbar.style.display = 'none';
  }
  
  // Hide footer
  const footer = document?.querySelector('.ss-footer');
  if (footer) {
    footer.style.display = 'none';
  }
  
  // Clear specific text content
  const bodyText = document?.querySelector('.body-text-2-regular');
  if (bodyText) {
    bodyText.textContent = '';
  }
  
  // Hide web back buttons and browser navigation - enhanced selectors
  if (!isPaymentPage) {
    const backButtonSelectors = [
      '[aria-label*="back"]', 
      '[title*="back"]', 
      '.back-button', 
      '.btn-back',
      '.back-btn',
      '.go-back',
      '.navigation-back',
      '.booking-back-button',  // Specific booking back button
      '.booking-header',       // Entire booking header
      '[class*="back"]',
      '[id*="back"]'
    ].join(', ');
    
    const backButtons = document?.querySelectorAll(backButtonSelectors);
    backButtons?.forEach(btn => {
      if (btn) btn.style.display = 'none';
    });
    
    // Hide elements containing back text (like "← Back") - more targeted
    const backButtonElements = document?.querySelectorAll('a, button, .booking-back-button, .back-button');
    backButtonElements?.forEach(el => {
      if (el && el.textContent) {
        const text = el.textContent.trim().toLowerCase();
        if (text === 'back' || text === '← back' || text.startsWith('← back')) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        }
      }
    });
    
    // Additional specific targeting for booking elements
    const bookingElements = [
      '.booking-header',
      '.booking-back-button', 
      '.booking-header-title',
      '[class*="booking"]',
      'img[src*="Back-Arrow"]',
      'img[src*="back"]'
    ];
    
    bookingElements.forEach(selector => {
      const elements = document?.querySelectorAll(selector);
      elements?.forEach(el => {
        if (el) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        }
      });
    });
  }
  
  // Hide browser-specific navigation elements
  const navSelectors = [
    '.navbar', 
    '.navigation', 
    '.nav-bar', 
    '.header-nav', 
    '.breadcrumb',
    '.page-header',
    '.top-nav',
    '.site-header'
  ].join(', ');
  
  const navElements = document?.querySelectorAll(navSelectors);
  navElements?.forEach(nav => {
    if (nav) nav.style.display = 'none';
  });
}

// Inject CSS to hide back buttons and navigation elements
function injectHideStyles() {
  // Don't inject aggressive styles on checkout/payment/booking pages
  const isPaymentPage = window.location.href.includes('checkout') || 
                        window.location.href.includes('payment') ||
                        window.location.href.includes('stripe') ||
                        window.location.href.includes('reviewbooking') ||
                        window.location.href.includes('welcome/success') ||
                        window.location.href.includes('welcome/failure');
  
  if (isPaymentPage) {
    console.log('Payment/booking page detected - using minimal CSS injection');
    const style = document.createElement('style');
    style.textContent = \`
      /* Only hide top navbar on checkout pages */
      .navbar-wrapper {
        display: none !important;
      }
      .ss-footer {
        display: none !important;
      }
    \`;
    document.head.appendChild(style);
    return;
  }

  const style = document.createElement('style');
  style.textContent = \`
    /* Hide various back button patterns */
    [aria-label*="back" i],
    [title*="back" i],
    .back-button,
    .btn-back,
    .back-btn,
    .go-back,
    .navigation-back,
    .booking-back-button,
    .booking-header,
    [class*="back" i],
    [id*="back" i] {
      display: none !important;
    }
    
    /* Hide specific booking elements */
    .booking-header.w-clearfix,
    .booking-back-button.w-inline-block,
    div.booking-header,
    a.booking-back-button,
    .d-flex:has(img[src*="Back-Arrow"]),
    .booking-header-title {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }
    
    /* Hide specific back navigation elements */
    a[href*="back"],
    button[onclick*="back"],
    .back-navigation {
      display: none !important;
    }
    
    /* Hide navigation elements */
    .navbar,
    .navigation,
    .nav-bar,
    .header-nav,
    .breadcrumb,
    .page-header,
    .top-nav,
    .site-header,
    .navbar-wrapper {
      display: none !important;
    }
    
    /* Hide business name */
    .ss-bussiness-name--fc2 {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }
    
    /* Hide footer specifically on schedules and other pages */
    .ss-footer {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }
    
    /* Hide location switcher */
    .ss-location-switcher {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }
  \`;
  document.head.appendChild(style);
}

// Targeted back button hiding function
function targetedBackButtonHiding() {
  // Only hide specific booking navigation elements
  const backSelectors = [
    '.booking-header', 
    '.booking-back-button', 
    'a.booking-back-button',
    'div.booking-header'
  ];
  
  backSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
      });
    } catch (e) {
      // Ignore selector errors
    }
  });
  
  // Only hide elements that are specifically back buttons (not containing other content)
  const potentialBackButtons = document.querySelectorAll('a, button');
  potentialBackButtons.forEach(el => {
    if (el && el.textContent) {
      const text = el.textContent.trim();
      // Only hide if the element ONLY contains back text (no other content)
      if (text === 'Back' || text === '← Back' || (text.length < 10 && text.toLowerCase().includes('back'))) {
        el.style.display = 'none';
      }
    }
  });
}

// Run immediately and on content changes
injectHideStyles();
hideWebElements();

// Run targeted hiding multiple times to catch delayed elements
setTimeout(targetedBackButtonHiding, 100);
setTimeout(targetedBackButtonHiding, 500);
setTimeout(targetedBackButtonHiding, 1000);

// Handle modal detection
function handleModalOpened() {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'MODAL_OPENED'
  }));
  
  setTimeout(() => {
    const ssCardClose = document?.getElementById('default-close');
    const intoVideoClose = document?.querySelector('.intro-video-close-btn');
    if (ssCardClose) {
      ssCardClose.addEventListener('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MODAL_CLOSED'
        }));
      });
    }
    if (intoVideoClose) {
      intoVideoClose.addEventListener('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MODAL_CLOSED'
        }));
      });
    }
  }, 1000);
}

// Set up mutation observer for DOM changes
function setupModalObserver() {
  const targetNode = document.body;
  const config = {childList: true, subtree: true};

  const callback = function (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes) {
        for (const node of mutation.addedNodes) {
          if (node.querySelector && node.querySelector('.ss-auth-modal-form-wrapper')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGIN_MODAL_OPENED'
            }));
            const overlay = document.querySelector('.ss-overlay-bg');
            if (overlay) {
              overlay.style.display = 'none';
            }
            return;
          }
          if (node.querySelector && (
            node.querySelector('.navbar-wrapper') || 
            node.querySelector('.schedules-top-bar--bc3--bw1') ||
            node.querySelector('.back-button') ||
            node.querySelector('.navbar') ||
            node.querySelector('.back-btn') ||
            node.querySelector('.go-back') ||
            node.querySelector('.booking-header') ||
            node.querySelector('.booking-back-button') ||
            (node.textContent && (node.textContent.includes('Back') || node.textContent.includes('←')))
          )) {
            hideWebElements();
            targetedBackButtonHiding();
            return;
          }
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

// Initialize observer when page loads
if (document.readyState === 'loading') {
  window.addEventListener('load', setupModalObserver);
} else {
  setupModalObserver();
}

// Action detection for booking/checkout flows
function setupActionDetection() {
  // Skip action detection on payment domains
  const isPaymentPage = window.location.href.includes('checkout') || 
                        window.location.href.includes('payment') ||
                        window.location.href.includes('stripe') ||
                        window.location.href.includes('hcaptcha') ||
                        window.location.host.includes('stripe.com') ||
                        window.location.host.includes('hcaptcha.com');
  
  if (isPaymentPage) {
    console.log('Skipping action detection on payment domain');
    return;
  }

  let activeRequests = 0;
  let actionTimeout = null;

  // Hook into fetch API
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    activeRequests++;
    console.log('Fetch started, active requests:', activeRequests);
    
    return originalFetch.apply(this, args)
      .then(response => {
        activeRequests--;
        console.log('Fetch completed, active requests:', activeRequests);
        
        if (activeRequests === 0 && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'FETCH_DONE'
          }));
        }
        
        return response;
      })
      .catch(error => {
        activeRequests--;
        console.log('Fetch failed, active requests:', activeRequests);
        
        if (activeRequests === 0 && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'FETCH_DONE'
          }));
        }
        
        throw error;
      });
  };

  // Hook into XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(...args) {
    this._startTime = Date.now();
    return originalXHROpen.apply(this, args);
  };
  
  XMLHttpRequest.prototype.send = function(...args) {
    activeRequests++;
    console.log('XHR started, active requests:', activeRequests);
    
    const xhr = this;
    const originalOnReadyStateChange = xhr.onreadystatechange;
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        activeRequests--;
        console.log('XHR completed, active requests:', activeRequests);
        
        if (activeRequests === 0 && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'XHR_DONE'
          }));
        }
      }
      
      if (originalOnReadyStateChange) {
        originalOnReadyStateChange.apply(this, arguments);
      }
    };
    
    return originalXHRSend.apply(this, args);
  };

  // Hook booking/checkout buttons and actions
  function hookActionButtons() {
    const actionSelectors = [
      // Common booking selectors
      'button[data-action="book"]',
      'button[data-action="checkout"]', 
      'button[data-action="proceed"]',
      'button[id*="book"]',
      'button[id*="checkout"]',
      'button[id*="proceed"]',
      'button[class*="book"]',
      'button[class*="checkout"]',
      'button[class*="proceed"]',
      // Form submit buttons
      'form[action*="checkout"] button[type="submit"]',
      'form[action*="book"] button[type="submit"]',
      // Link-based actions
      'a[href*="checkout"]',
      'a[href*="book"]',
      // Text-based detection will be handled separately
      // Note: :contains() is not supported in querySelectorAll, handled below
      // Additional common patterns
      '.btn-book',
      '.btn-checkout',
      '.btn-proceed',
      '.book-button',
      '.checkout-button',
      '.proceed-button'
    ];

    actionSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!element.dataset.actionHooked) {
            element.dataset.actionHooked = 'true';
            
            element.addEventListener('click', function(event) {
              console.log('Action button clicked:', this);
              
              // Determine action type
              let actionType = 'booking';
              const text = this.textContent?.toLowerCase() || '';
              const classes = this.className?.toLowerCase() || '';
              const id = this.id?.toLowerCase() || '';
              
              if (text.includes('checkout') || classes.includes('checkout') || id.includes('checkout')) {
                actionType = 'checkout';
              } else if (text.includes('proceed') || classes.includes('proceed') || id.includes('proceed')) {
                actionType = 'proceed';
              } else if (text.includes('payment') || classes.includes('payment') || id.includes('payment')) {
                actionType = 'payment';
              }
              
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'ACTION_START',
                  action: actionType
                }));
              }

              // Set timeout to auto-end action if no network activity
              if (actionTimeout) {
                clearTimeout(actionTimeout);
              }
              
              actionTimeout = setTimeout(() => {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ACTION_END',
                    action: actionType,
                    reason: 'timeout'
                  }));
                }
              }, 10000); // 10 second timeout
            });
          }
        });
      } catch (e) {
        // Only log if it's not a selector syntax error (which is expected for :contains())
        if (e instanceof Error && !e.message.includes('is not a valid selector')) {
          console.log('Error hooking selector:', selector, e);
        }
      }
    });

    // Hook text-based buttons (fallback)
    const buttons = document.querySelectorAll('button, a[role="button"], .btn');
    buttons.forEach(button => {
      if (!button.dataset.actionHooked) {
        const text = button.textContent?.toLowerCase().trim() || '';
        const actionWords = ['book', 'checkout', 'proceed', 'continue', 'confirm', 'submit'];
        
        if (actionWords.some(word => text.includes(word))) {
          button.dataset.actionHooked = 'true';
          
          button.addEventListener('click', function() {
            console.log('Text-based action button clicked:', text);
            
            let actionType = 'booking';
            if (text.includes('checkout')) actionType = 'checkout';
            else if (text.includes('proceed')) actionType = 'proceed';
            else if (text.includes('continue')) actionType = 'continue';
            
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ACTION_START',
                action: actionType
              }));
            }
          });
        }
      }
    });
  }

  // Initial hook
  hookActionButtons();
  
  // Re-hook on DOM changes
  const actionObserver = new MutationObserver(() => {
    hookActionButtons();
  });
  
  actionObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Monitor navigation changes
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(() => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ACTION_END',
          reason: 'navigation'
        }));
      }
    }, 500);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    setTimeout(() => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ACTION_END', 
          reason: 'navigation'
        }));
      }
    }, 500);
  };

  // Stop monitoring after 15 seconds to prevent resource leaks
  setTimeout(() => {
    if (actionObserver) {
      actionObserver.disconnect();
    }
  }, 15000);
}

// Initialize action detection
setTimeout(setupActionDetection, 1000);

true; // Required for injected JavaScript
`;

// Generate navigation script for bottom menu
export const generateNavigationScript = (route: string) => {
  return `
    window.postMessage(JSON.stringify({
      type: 'NAVIGATE_TO',
      route: '${route}'
    }), "*");
    true;
  `;
};

// Add query parameter to URL
export const addQueryParam = (url: string, param: string = 'isWebView=true'): string => {
  if (url.includes(param)) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${param}`;
};