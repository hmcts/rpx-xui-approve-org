import {
  UIConfig,
  UIConfigCookies,
  UIConfigExceptionOptions,
  UIConfigServices
} from '../interfaces/ui.config'
import {healthEndpoints} from './health'
import {getConfigValue, getEnvironment} from './index'
import {
  COOKIE_TOKEN,
  COOKIES_USERID,
  HTTP_PROXY,
  IDAM_CLIENT,
  INDEX_URL,
  LOGGING,
  MAX_LINES,
  MAX_LOG_LINE,
  MICROSERVICE,
  NO_PROXY,
  NOW,
  OAUTH_CALLBACK_URL,
  PROTOCOL,
  SECURE_COOKIE,
  SERVICE_S2S_PATH,
  SERVICES_CCD_DATA_API_PATH,
  SERVICES_CCD_DEF_API_PATH,
  SERVICES_FEE_AND_PAY_PATH,
  SERVICES_IDAM_API_PATH,
  SERVICES_IDAM_WEB,
  SERVICES_RD_PROFESSIONAL_API_PATH,
  SESSION_SECRET
} from './references'

export const uiConfig = (): UIConfig => {

  const configEnv = getEnvironment()

  return {
    configEnv,
    cookies: {
      token: getConfigValue(COOKIE_TOKEN),
      userId: getConfigValue(COOKIES_USERID),
    } as UIConfigCookies,
    exceptionOptions: {
      maxLines: getConfigValue(MAX_LINES),
    } as UIConfigExceptionOptions,
    health: healthEndpoints() as UIConfigServices,
    idamClient: getConfigValue(IDAM_CLIENT),
    indexUrl: getConfigValue(INDEX_URL),
    logging: getConfigValue(LOGGING),
    maxLogLine: getConfigValue(MAX_LOG_LINE),
    microservice: getConfigValue(MICROSERVICE),
    noProxy: NO_PROXY,
    now: getConfigValue(NOW),
    oauthCallbackUrl: getConfigValue(OAUTH_CALLBACK_URL),
    protocol: getConfigValue(PROTOCOL),
    proxy: HTTP_PROXY,
    secureCookie: getConfigValue(SECURE_COOKIE),
    services: {
      ccdDataApi: getConfigValue(SERVICES_CCD_DATA_API_PATH),
      ccdDefApi: getConfigValue(SERVICES_CCD_DEF_API_PATH),
      feeAndPayApi: getConfigValue(SERVICES_FEE_AND_PAY_PATH),
      idamApi: getConfigValue(SERVICES_IDAM_API_PATH),
      idamWeb: getConfigValue(SERVICES_IDAM_WEB),
      rdProfessionalApi: getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH),
      s2s: getConfigValue(SERVICE_S2S_PATH),
    } as UIConfigServices,
    sessionSecret: getConfigValue(SESSION_SECRET),
  }
}
