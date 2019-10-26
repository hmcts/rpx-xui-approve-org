import {
  EnvironmentConfig,
  EnvironmentConfigCookies,
  EnvironmentConfigExceptionOptions, EnvironmentConfigProxy, EnvironmentConfigServices
} from '../../../api/interfaces/environment.config';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService implements EnvironmentConfig {

  config$ = this.http.get<any>('/api/environment/config').pipe( shareReplay(1) );

  constructor(private http: HttpClient) {
    this.config$.subscribe( config => {
      for (const configKey in config) {
        if (config.hasOwnProperty(configKey)) {
          this[configKey] = config[configKey];
        }
      }
    });
  }

  readonly appInsightsInstrumentationKey: string;
  readonly configEnv: string;
  readonly cookies: EnvironmentConfigCookies;
  readonly exceptionOptions: EnvironmentConfigExceptionOptions;
  readonly health: EnvironmentConfigServices;
  readonly idamClient: string;
  readonly indexUrl: string;
  readonly logging: string;
  readonly maxLogLine: number;
  readonly microservice: string;
  readonly now: boolean;
  readonly oauthCallbackUrl: string;
  readonly port: number;
  readonly protocol: string;
  readonly proxy: EnvironmentConfigProxy;
  readonly secureCookie: boolean;
  readonly services: EnvironmentConfigServices;
  readonly sessionSecret: string;
}
