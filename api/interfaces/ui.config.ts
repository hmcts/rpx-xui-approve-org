export interface UIConfig {
  configEnv: string,
  cookies: UIConfigCookies,
  idamClient: string,
  oauthCallbackUrl: string,
  protocol: string,
  services: UIConfigServices,
  oidcEnabled: boolean,
  launchDarklyClientId?: string
}

export interface UIConfigCookies {
  token: string,
  userId: string,
  roles: string
}

export interface UIConfigServices {
  idamWeb: string
}

export interface HealthConfigServices {
  ccdDataApi: string,
  ccdDefApi: string,
  idamApi: string,
  idamWeb: string,
  rdProfessionalApi: string,
  s2s: string,
  feeAndPayApi: string
}
