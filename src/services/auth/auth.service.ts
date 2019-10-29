import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { AppConstants } from 'src/app/app.constants';
import { JwtDecodeWrapper } from 'src/app/services/jwtDecodeWrapper';
import { AppUtils } from 'src/app/utils/app-utils';
import { environment as config } from '../../environments/environment';

interface CookieKeys {
  TOKEN: string;
  USER: string;
}

@Injectable()
export class AuthService {
  private readonly apiBaseUrl: string;
  private readonly COOKIE_KEYS: CookieKeys;

  constructor(
    private readonly cookieService: CookieService,
    private readonly jwtDecoder: JwtDecodeWrapper
  ) {
    this.COOKIE_KEYS = {
      TOKEN: config.cookies.token,
      USER: config.cookies.userId
    };

    this.apiBaseUrl = `${window.location.protocol}//${window.location.hostname}`;

    if (window.location.port) { // don't add colon if there is no port
      this.apiBaseUrl +=  `:${window.location.port}`;
    }
  }

  public loginRedirect() {
    window.location.href = this._generateLoginUrl();
  }

  public isAuthenticated(): boolean {
    const jwt = this.cookieService.get(this.COOKIE_KEYS.TOKEN);
    if (!jwt) {
      return false;
    }
    const jwtData = this.jwtDecoder.decode<{ exp: number; }>(jwt);
    const notExpired = jwtData.exp > Math.round(new Date().getTime() / 1000);
    // do stuff!!
    return notExpired;
  }

  private _generateLoginUrl(): string {
    const env = AppUtils.getEnvironment(window.location.origin);
    const base = AppConstants.REDIRECT_URL[env];
    const clientId = config.urls.idam.idamClientID;
    const callback = `${this.apiBaseUrl}/${config.urls.idam.oauthCallbackUrl}`;
    // tslint:disable-next-line: max-line-length
    return `${base}/login?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=profile openid roles manage-user create-user manage-roles`;
  }
}
