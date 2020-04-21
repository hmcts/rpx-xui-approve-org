export interface UIConfig {
  configEnv: string,
  cookies: UIConfigCookies,
  exceptionOptions: UIConfigExceptionOptions,
  health: UIConfigServices,
  idamClient: string,
  indexUrl: string,
  logging: string,
  now: boolean,
  maxLogLine: number,
  microservice: string,
  oauthCallbackUrl: string,
  protocol: string,
  secureCookie: boolean,
  services: UIConfigServices,
  sessionSecret: string,
  oidcEnabled: boolean,
}

export interface UIConfigCookies {
  token: string,
  userId: string,
}

export interface UIConfigExceptionOptions {
  maxLines: number,
}

export interface UIConfigServices {
  ccdDataApi: string,
  ccdDefApi: string,
  idamApi: string,
  idamWeb: string,
  rdProfessionalApi: string,
  s2s: string,
  feeAndPayApi: string
}
