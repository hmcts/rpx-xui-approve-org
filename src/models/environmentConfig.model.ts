import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  configEnv?: string;
  cookies: EnvironmentConfigCookies;
  idamClient: string;
  indexUrl: string;
  now: boolean;
  microservice: string;
  oauthCallbackUrl: string;
  protocol: string;
  services: EnvironmentConfigServices;
  oidcEnabled: boolean;
  launchDarklyClientId?: string;
}

export interface EnvironmentConfigCookies {
  token: string;
  userId: string;
  roles: string;
}
export interface EnvironmentConfigServices {
  idamWeb: string;
}

export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>('environment.config');
