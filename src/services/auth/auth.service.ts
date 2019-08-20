import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import * as jwtDecode from 'jwt-decode';
import { environment as config } from '../../environments/environment';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {
  apiBaseUrl;
  COOKIE_KEYS;
  user;
  constructor(
    private cookieService: CookieService,
  ) {
    this.COOKIE_KEYS = {
      TOKEN: config.cookies.token,
      USER: config.cookies.userId
    };

    this.apiBaseUrl = window.location.protocol + '//' + window.location.hostname;

    if (window.location.port) { // don't add colon if there is no port
      this.apiBaseUrl +=   ':' + window.location.port;
    }

    this.user = null;
  }

  canActivate() {
    console.log('reached can activate');
    if (!this.isAuthenticated()) {
      this.loginRedirect();
      return false;
    }

    return true;
  }

  generateLoginUrl() {
    // So this should be coming in on 443
    const base = config.urls.idam.idamLoginUrl;
    const clientId = config.urls.idam.idamClientID;
    const callback = `${this.apiBaseUrl}/${config.urls.idam.oauthCallbackUrl}`;
    return `${base}/login?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=openid profile roles manage-user create-user`;
  }

  loginRedirect() {
    window.location.href = this.generateLoginUrl();
  }

  decodeJwt(jwt) {
    return jwtDecode(jwt);
  }

  isAuthenticated(): boolean {
    const jwt = this.cookieService.get(this.COOKIE_KEYS.TOKEN);
    if (!jwt) {
      return false;
    }
    const jwtData = this.decodeJwt(jwt);
    const notExpired = jwtData.exp > Math.round(new Date().getTime() / 1000);
    // do stuff!!
    return notExpired;
  }
}
