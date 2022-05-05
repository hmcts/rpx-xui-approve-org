import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from '../../app/services/environment.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly envService: EnvironmentService,
    private readonly httpService: HttpClient
  ) {
  }
  // TODO remove/toggle this for oidc
  public generateLoginUrl(): Observable<string> {
    return this.envService.getEnv$().pipe(
      map( config => {
        const port = window.location.port ? `:${window.location.port}` : ``;
        const API_BASE_URL = `${config.protocol}://${window.location.hostname}${port}`;
        const base = config.services.idamWeb;
        const clientId = config.idamClient;
        const callback = `${API_BASE_URL}${config.oauthCallbackUrl}`;
        // eslint-disable-next-line max-len
        return `${base}/login?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=profile openid roles manage-user create-user manage-roles`;
      })
    );
  }

  public loginRedirect() {
    const featureEnabled = this.envService.get('oidcEnabled');
    if (featureEnabled) {
      this.redirect('/auth/login');
    } else {
      this.generateLoginUrl().subscribe( url => {
        this.redirect(url);
      });
    }
  }

  public decodeJwt(jwt) {
    return jwt_decode(jwt);
  }

 public isAuthenticated(): Observable<boolean> {
    return this.httpService.get<boolean>('/auth/isAuthenticated');
  }

  public redirect(url: string) {
    window.location.href = url;
  }
}
