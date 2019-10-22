import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie';
import * as jwtDecode from 'jwt-decode';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import {EnvironmentService} from '../../app/services/environment.service';
import {Observable} from 'rxjs';

@Injectable()
export class AuthService {
  apiBaseUrl;
  user;
  constructor(
    private cookieService: CookieService,
    private envService: EnvironmentService
  ) {
    this.apiBaseUrl = window.location.protocol + '//' + window.location.hostname;

    if (window.location.port) { // don't add colon if there is no port
      this.apiBaseUrl += ':' + window.location.port;
    }

    this.user = null;
  }

  generateLoginUrl(): Observable<string> {
    return this.envService.config$.map( config => {
      const base = config.services.idamWeb;
      const clientId = config.idamClient;
      const callback = `${this.apiBaseUrl}${config.oauthCallbackUrl}`;
      // tslint:disable-next-line: max-line-length
      return `${base}/login?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=profile openid roles manage-user create-user manage-roles`;
    });
  }

  loginRedirect() {
    this.generateLoginUrl().subscribe( url => {
      window.location.href = url;
    });
  }

  decodeJwt(jwt) {
    return jwtDecode(jwt);
  }

 isAuthenticated(): Observable<boolean> {
    return this.envService.config$.map( config => {
      const jwt = this.cookieService.get(config.cookies.token);
      if (!jwt) {
        return false;
      }
      const jwtData = this.decodeJwt(jwt);
      // do stuff!!
      return jwtData.exp > Math.round(new Date().getTime() / 1000);
    });

  }
}
