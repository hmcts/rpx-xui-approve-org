import { Injectable } from '@angular/core';
import * as jwtDecode from 'jwt-decode';
import { CookieService } from 'ngx-cookie';
import { Observable, of } from 'rxjs';
import { EnvironmentService } from '../../app/services/environment.service';


@Injectable()
export class AuthService {
  private readonly apiBaseUrl: string;
  public user: any;
  constructor(
    private readonly cookieService: CookieService,
    private readonly envService: EnvironmentService
  ) {
    this.apiBaseUrl = `${window.location.protocol}//${window.location.hostname}`;

    if (window.location.port) { // don't add colon if there is no port
      this.apiBaseUrl += `:${window.location.port}`;
    }

    this.user = null;
  }
  // TODO perhaps move this logic to BE
  private generateLoginUrl(): Observable<string> {
    const base = this.envService.get('services').idamWeb;
    const clientId = this.envService.get('idamClient');
    const callback = this.apiBaseUrl + this.envService.get('oauthCallbackUrl');
    return of(`${base}/login?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=profile openid roles manage-user create-user manage-roles`);
  }

  public loginRedirect() {
    this.generateLoginUrl().subscribe( url => {
      window.location.href = url;
    });
  }

  private decodeJwt(jwt) {
    return jwtDecode(jwt);
  }

 public isAuthenticated(): Observable<boolean> {
    const token = this.envService.get('cookies').token;
    const jwt = this.cookieService.get(token);
    if (!jwt) {
      return of(false);
    }
    const jwtData = this.decodeJwt(jwt);
    // do stuff!!
    return of(jwtData.exp > Math.round(new Date().getTime() / 1000));
  }
}
