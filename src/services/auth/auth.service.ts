import {Injectable} from '@angular/core';
import * as jwtDecode from 'jwt-decode';
import {CookieService} from 'ngx-cookie';

import {Observable} from 'rxjs';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import {EnvironmentService} from '../../app/services/environment.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly cookieService: CookieService,
    private readonly envService: EnvironmentService
  ) {
  }
  // TODO perhaps move this logic to BE
  public generateLoginUrl(): Observable<string> {
    return this.envService.config$.map( config => {
      const port = window.location.port ? `:${window.location.port}` : ``;
      const API_BASE_URL = `${config.protocol}://${window.location.hostname}${port}`;
      const base = config.services.idamWeb;
      const clientId = config.idamClient;
      const callback = `${API_BASE_URL}${config.oauthCallbackUrl}`;
      // tslint:disable-next-line: max-line-length
      return `${base}/login?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=profile openid roles manage-user create-user manage-roles`;
    });
  }

  public loginRedirect() {
    this.generateLoginUrl().subscribe( url => {
      window.location.href = url;
    });
  }

  public decodeJwt(jwt) {
    return jwtDecode(jwt);
  }

 public isAuthenticated(): Observable<boolean> {
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
