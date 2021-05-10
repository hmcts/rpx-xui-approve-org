import { getConfigValue, getEnvironment, showFeature } from '.';
import { UIConfig, UIConfigCookies, UIConfigExceptionOptions, UIConfigServices } from '../interfaces/ui.config';
import { healthEndpoints } from './health';
import {
  COOKIE_ROLES,
  COOKIE_TOKEN,
  COOKIES_USERID,
  FEATURE_OIDC_ENABLED,
  FEATURE_SECURE_COOKIE_ENABLED,
  IDAM_CLIENT,
  INDEX_URL,
  LAUNCH_DARKLY_CLIENT_ID,
  LOGGING,
  MAX_LINES,
  MAX_LOG_LINE,
  MICROSERVICE,
  NOW,
  OAUTH_CALLBACK_URL,
  PROTOCOL,
  SERVICE_S2S_PATH,
  SERVICES_CCD_DATA_API_PATH,
  SERVICES_CCD_DEF_API_PATH,
  SERVICES_FEE_AND_PAY_PATH,
  SERVICES_IDAM_API_PATH,
  SERVICES_IDAM_WEB,
  SERVICES_ISS_PATH,
  SERVICES_RD_PROFESSIONAL_API_PATH,
  SESSION_SECRET,
} from './references';

export const uiConfig = (): UIConfig => {

  const configEnv = getEnvironment()

  return {
    configEnv,
    cookies: {
      roles: getConfigValue(COOKIE_ROLES),
      token: getConfigValue(COOKIE_TOKEN),
      userId: getConfigValue(COOKIES_USERID),
    } as UIConfigCookies,
    exceptionOptions: {
      maxLines: getConfigValue(MAX_LINES),
    } as UIConfigExceptionOptions,
    health: healthEndpoints() as UIConfigServices,
    idamClient: getConfigValue(IDAM_CLIENT),
    indexUrl: getConfigValue(INDEX_URL),
    iss: getConfigValue(SERVICES_ISS_PATH),
    logging: getConfigValue(LOGGING),
    maxLogLine: getConfigValue(MAX_LOG_LINE),
    microservice: getConfigValue(MICROSERVICE),
    now: getConfigValue(NOW),
    oauthCallbackUrl: getConfigValue(OAUTH_CALLBACK_URL),
    oidcEnabled: showFeature(FEATURE_OIDC_ENABLED),
    protocol: getConfigValue(PROTOCOL),
    secureCookie: showFeature(FEATURE_SECURE_COOKIE_ENABLED),
    services: {
      ccdDataApi: getConfigValue(SERVICES_CCD_DATA_API_PATH),
      ccdDefApi: getConfigValue(SERVICES_CCD_DEF_API_PATH),
      feeAndPayApi: getConfigValue(SERVICES_FEE_AND_PAY_PATH),
      idamApi: getConfigValue(SERVICES_IDAM_API_PATH),
      idamWeb: getConfigValue(SERVICES_IDAM_WEB),
      iss: getConfigValue(SERVICES_ISS_PATH),
      rdProfessionalApi: getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH),
      s2s: getConfigValue(SERVICE_S2S_PATH),
    } as UIConfigServices,
    sessionSecret: getConfigValue(SESSION_SECRET),
    launchDarklyClientId: getConfigValue(LAUNCH_DARKLY_CLIENT_ID)
  }
}
