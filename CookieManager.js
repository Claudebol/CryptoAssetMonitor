class CookieManager{
  constructor(){

  }
}

CookieManager.prototype.setCookie = function (cname, cvalue, exdays) {
  let d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

CookieManager.prototype.getCookie = function (cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

CookieManager.prototype.compareCookie = function (cname, value) {
  let cookie = this.getCookie(cname);
  return cookie === value;
};

CookieManager.prototype.invalidateCookie = function (cname) {
  this.setCookie(cname, '', 365);
};
