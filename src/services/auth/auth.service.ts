import { Injectable } from '@angular/core';
import * as jwtDecode from 'jwt-decode';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from '../../app/services/environment.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly envService: EnvironmentService,
    private readonly httpService: HttpClient
  ) {}

  // TODO remove/toggle this for oidc
  public generateLoginUrl(): Observable<string> {
    return this.envService.getEnv$().pipe(map((config) => {
      const port = window.location.port ? `:${window.location.port}` : '';
      const API_BASE_URL = `${config.protocol}://${window.location.hostname}${port}`;
      const base = config.services.idamWeb;
      const clientId = config.idamClient;
      const callback = `${API_BASE_URL}${config.oauthCallbackUrl}`;
      return `${base}/login?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=profile openid roles manage-user create-user manage-roles`;
    }));
  }

  public loginRedirect() {
    const featureEnabled = this.envService.get('oidcEnabled');
    if (featureEnabled) {
      window.location.href = '/auth/login';
    } else {
      this.generateLoginUrl().subscribe((url) => {
        window.location.href = url;
      });
    }
  }

  public decodeJwt(jwt) {
    return jwtDecode(jwt);
  }

  public isAuthenticated(): Observable<boolean> {
    return this.httpService.get<boolean>('/auth/isAuthenticated');
  }
}
