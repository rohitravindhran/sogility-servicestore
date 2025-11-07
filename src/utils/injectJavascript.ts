
export const INJECTED_JAVASCRIPT = `
          

var viewport = document?.querySelector("meta[name=viewport]");
viewport?.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
if(document?.querySelector('.navbar-wrapper')){
document.querySelector('.navbar-wrapper').style.display = 'none';
}
if(document?.querySelector('.schedules-top-bar--bc3--bw1')){
document.querySelector('.schedules-top-bar--bc3--bw1').style.top = '0px';
}
if(document?.querySelector('.ss-footer')){

document.querySelector('.ss-footer').style.display = 'none';
}
if(document?.querySelector('.body-text-2-regular')){

  document.querySelector('.body-text-2-regular').textContent = '';
}
if(document?.querySelector('.breadcrumb--fc2')){
  document.querySelector('.breadcrumb--fc2').style.display = 'none';
  document.querySelector('.ss-container').style.marginTop = '-15px';

}


true;



 `;