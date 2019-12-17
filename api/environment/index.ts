import * as express from 'express'
import {getConfigProp} from '../configuration'
import {
  COOKIE_TOKEN,
  COOKIES_USERID,
  IDAM_CLIENT,
  INDEX_URL,
  LOGGING,
  MAX_LINES,
  MAX_LOG_LINE,
  MICROSERVICE,
  NOW,
  OAUTH_CALLBACK_URL,
  PROTOCOL, PROXY_HOST, PROXY_PORT,
  SECURE_COOKIE,
  SERVICE_S2S_PATH,
  SERVICES_CCD_DATA_API_PATH,
  SERVICES_CCD_DEF_API_PATH,
  SERVICES_IDAM_API_PATH,
  SERVICES_IDAM_WEB,
  SERVICES_RD_PROFESSIONAL_API_PATH,
  SESSION_SECRET
} from '../configuration/constants'
import {EnvironmentConfigCookies, EnvironmentConfigExceptionOptions, EnvironmentConfigProxy, EnvironmentConfigServices} from '../interfaces/environment.config'
// import { environmentConfig } from '../lib/environment.config'

export const router = express.Router({mergeParams: true})

router.get('/config', environmentRoute)

async function environmentRoute(req, res) {
  // const config = { ...environmentConfig }
  const HEALTH = '/health'
  const configEnv = process.env.NODE_ENV

  const config = {
    configEnv,
    cookies: {
      token: getConfigProp(COOKIE_TOKEN),
      userId: getConfigProp(COOKIES_USERID),
    } as EnvironmentConfigCookies,
    exceptionOptions: {
      maxLines: getConfigProp(MAX_LINES),
    } as EnvironmentConfigExceptionOptions,
    health: {
      ccdDataApi: getConfigProp(SERVICES_CCD_DATA_API_PATH) + HEALTH,
      ccdDefApi: getConfigProp(SERVICES_CCD_DEF_API_PATH) + HEALTH,
      idamApi: getConfigProp(SERVICES_IDAM_API_PATH) + HEALTH,
      idamWeb: getConfigProp(SERVICES_IDAM_WEB) + HEALTH,
      rdProfessionalApi: getConfigProp(SERVICES_RD_PROFESSIONAL_API_PATH) + HEALTH,
      s2s: getConfigProp(SERVICE_S2S_PATH) + HEALTH,
    } as EnvironmentConfigServices,
    idamClient: getConfigProp(IDAM_CLIENT),
    indexUrl: getConfigProp(INDEX_URL),
    logging: getConfigProp(LOGGING),
    maxLogLine: getConfigProp(MAX_LOG_LINE),
    microservice: getConfigProp(MICROSERVICE),
    now: getConfigProp(NOW),
    oauthCallbackUrl: getConfigProp(OAUTH_CALLBACK_URL),
    protocol: getConfigProp(PROTOCOL),
    proxy: {
      host: getConfigProp(PROXY_HOST),
      port: getConfigProp(PROXY_PORT),
    } as EnvironmentConfigProxy,
    secureCookie: getConfigProp(SECURE_COOKIE),
    services: {
      ccdDataApi: getConfigProp(SERVICES_CCD_DATA_API_PATH),
      ccdDefApi: getConfigProp(SERVICES_CCD_DEF_API_PATH),
      idamApi: getConfigProp(SERVICES_IDAM_API_PATH),
      idamWeb: getConfigProp(SERVICES_IDAM_WEB),
      rdProfessionalApi: getConfigProp(SERVICES_RD_PROFESSIONAL_API_PATH),
      s2s: getConfigProp(SERVICE_S2S_PATH),
    } as EnvironmentConfigServices,
    sessionSecret: getConfigProp(SESSION_SECRET),
  }

  res.status(200).send(config)
}

export default router
