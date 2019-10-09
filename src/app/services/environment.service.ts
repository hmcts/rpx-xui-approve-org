import {
  EnvironmentConfig,
  EnvironmentConfigCookies,
  EnvironmentConfigExceptionOptions, EnvironmentConfigProxy, EnvironmentConfigServices
} from '../../../api/interfaces/environment.config';

export class EnvironmentService implements EnvironmentConfig {

  constructor() { }

  appInsightsInstrumentationKey: string;
  cookies: EnvironmentConfigCookies;
  exceptionOptions: EnvironmentConfigExceptionOptions;
  health: EnvironmentConfigServices;
  idamClient: string;
  indexUrl: string;
  logging: string;
  maxLogLine: number;
  microservice: string;
  now: boolean;
  oauthCallbackUrl: string;
  port: number;
  protocol: string;
  proxy: EnvironmentConfigProxy;
  secureCookie: boolean;
  services: EnvironmentConfigServices;
  sessionSecret: string;
}
