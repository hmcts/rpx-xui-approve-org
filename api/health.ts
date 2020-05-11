import * as express from 'express'
import {getConfigValue, showFeature} from './configuration'
import {
  COOKIE_TOKEN,
  COOKIES_USERID,
  FEATURE_APP_INSIGHTS_ENABLED,
  FEATURE_PROXY_ENABLED,
  FEATURE_SECURE_COOKIE_ENABLED,
  IDAM_CLIENT,
  MAX_LINES,
  MAX_LOG_LINE,
  MICROSERVICE,
  NOW,
  OAUTH_CALLBACK_URL,
  PROTOCOL,
  SERVICE_S2S_PATH,
  SERVICES_FEE_AND_PAY_PATH,
  SERVICES_IDAM_API_PATH,
  SERVICES_IDAM_WEB,
  SERVICES_RD_PROFESSIONAL_API_PATH,
  SESSION_SECRET
} from './configuration/references'

const router = express.Router({ mergeParams: true })

router.get('/', (req, res) => {
  res.status(200).send({
    allowConfigMutations: process.env.ALLOW_CONFIG_MUTATIONS,
    nodeConfigEnv: process.env.NODE_CONFIG_ENV,
    // 1st set
    // tslint:disable-next-line:object-literal-sort-keys
    idamClient: getConfigValue(IDAM_CLIENT),
    maxLogLine: getConfigValue(MAX_LOG_LINE),
    microService: getConfigValue(MICROSERVICE),
    maxLines: getConfigValue(MAX_LINES),
    now: getConfigValue(NOW),
    // 2nd set
    cookieToken: getConfigValue(COOKIE_TOKEN),
    cookieUserId: getConfigValue(COOKIES_USERID),
    oauthCallBack: getConfigValue(OAUTH_CALLBACK_URL),
    protocol: getConfigValue(PROTOCOL),
    // 3rd set
    idamApiPath: getConfigValue(SERVICES_IDAM_API_PATH),
    idamWeb: getConfigValue(SERVICES_IDAM_WEB),
    s2sPath: getConfigValue(SERVICE_S2S_PATH),
    rdProfessionalApi: getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH),
    feeAndPayApi: getConfigValue(SERVICES_FEE_AND_PAY_PATH),
    // 4th set
    sessionSecret: getConfigValue(SESSION_SECRET),
    // 5th set
    featureSecureCookieEnabled: showFeature(FEATURE_SECURE_COOKIE_ENABLED),
    featureAppInsightEnabled: showFeature(FEATURE_APP_INSIGHTS_ENABLED),
    featureProxyEnabled: showFeature(FEATURE_PROXY_ENABLED),
  })
})

export default router
