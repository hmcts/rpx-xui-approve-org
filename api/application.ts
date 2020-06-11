import * as healthcheck from '@hmcts/nodejs-healthcheck'
import { S2S, SESSION, xuiNode } from '@hmcts/rpx-xui-node-lib'
import axios from 'axios'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as helmet from 'helmet'
import {attach} from './auth'
import {environmentCheckText, getConfigValue, getEnvironment, showFeature} from './configuration'
import {ERROR_NODE_CONFIG_ENV} from './configuration/constants'
import {
  APP_INSIGHTS_KEY,
  COOKIE_TOKEN,
  COOKIES_USERID,
  FEATURE_APP_INSIGHTS_ENABLED,
  FEATURE_HELMET_ENABLED,
  FEATURE_OIDC_ENABLED,
  FEATURE_PROXY_ENABLED,
  FEATURE_REDIS_ENABLED,
  FEATURE_SECURE_COOKIE_ENABLED,
  HELMET,
  IDAM_CLIENT,
  IDAM_SECRET,
  MAX_LINES,
  MAX_LOG_LINE,
  MICROSERVICE,
  NOW,
  OAUTH_CALLBACK_URL,
  PROTOCOL,
  REDIS_KEY_PREFIX,
  REDIS_TTL,
  REDISCLOUD_URL, S2S_SECRET,
  SERVICE_S2S_PATH,
  SERVICES_FEE_AND_PAY_PATH,
  SERVICES_IDAM_API_PATH,
  SERVICES_IDAM_WEB,
  SERVICES_ISS_PATH,
  SERVICES_RD_PROFESSIONAL_API_PATH,
  SESSION_SECRET
} from './configuration/references'
import {appInsights} from './lib/appInsights'
import {errorStack} from './lib/errorStack'
import * as log4jui from './lib/log4jui'
import * as tunnel from './lib/tunnel'
import routes from './routes'

export const app = express()

export const logger = log4jui.getLogger('server')

/**
 * If there are no configuration properties found we highlight this to the person attempting to initialise
 * this application.
 */
if (!getEnvironment()) {
  console.log(ERROR_NODE_CONFIG_ENV)
}

/**
 * TODO: Implement a logger on the Node layer.
 */
console.log(environmentCheckText())

// TODO: Testing that we can get the environment variables on AAT from the .yaml file
console.log('ENV PRINT')
console.log(process.env.NODE_CONFIG_ENV)
console.log('process.env.ALLOW_CONFIG_MUTATIONS')
console.log(process.env.ALLOW_CONFIG_MUTATIONS)

// 1st set
console.log(getConfigValue(IDAM_CLIENT))
console.log(getConfigValue(MAX_LOG_LINE))
console.log(getConfigValue(MICROSERVICE))
console.log(getConfigValue(MAX_LINES))
console.log(getConfigValue(NOW))

// 2nd set
console.log(getConfigValue(COOKIE_TOKEN))
console.log(getConfigValue(COOKIES_USERID))

console.log(getConfigValue(OAUTH_CALLBACK_URL))
console.log(getConfigValue(PROTOCOL))

// 3rd set
console.log(getConfigValue(SERVICES_IDAM_API_PATH))
console.log(getConfigValue(SERVICES_IDAM_WEB))
console.log(getConfigValue(SERVICE_S2S_PATH))
console.log(getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH))

console.log('Secure Cookie is:')
console.log(showFeature(FEATURE_SECURE_COOKIE_ENABLED))
console.log('App Insights enabled:')
console.log(showFeature(FEATURE_APP_INSIGHTS_ENABLED))
console.log('Proxy enabled:')
console.log(showFeature(FEATURE_PROXY_ENABLED))
console.log('Terms and Conditions enabled:')
console.log('Helmet enabled:')
console.log(showFeature(FEATURE_HELMET_ENABLED))

if (showFeature(FEATURE_HELMET_ENABLED)) {
  console.log('Helmet enabled')
  app.use(helmet(getConfigValue(HELMET)))
}

console.log('OIDC enabled:')
console.log(showFeature(FEATURE_OIDC_ENABLED))

console.log('SERVICES_ISS_PATH:')
console.log(getConfigValue(SERVICES_ISS_PATH))

if (showFeature(FEATURE_OIDC_ENABLED)) {
  console.log('OIDC enabled')
}

const secret = getConfigValue(IDAM_SECRET)
const idamClient = getConfigValue(IDAM_CLIENT)
const idamWebUrl = getConfigValue(SERVICES_IDAM_WEB)
const issuerUrl = getConfigValue(SERVICES_ISS_PATH)
const idamApiPath = getConfigValue(SERVICES_IDAM_API_PATH)

const s2sSecret = getConfigValue(S2S_SECRET)

const tokenUrl = `${getConfigValue(SERVICES_IDAM_API_PATH)}/oauth2/token`
const authorizationUrl = `${idamWebUrl}/login`
console.log('tokenUrl', tokenUrl)

//TODO: we can move these out into proper config at some point to tidy up even further
const options = {
  authorizationURL: authorizationUrl,
  callbackURL: 'https://xui-ao-webapp-pr-338.service.core-compute-preview.internal/oauth2/callback',
  clientID: idamClient,
  clientSecret: secret,
  discoveryEndpoint: `${idamWebUrl}/o`,
  issuerURL: issuerUrl,
  logoutURL: idamApiPath,
  responseTypes: ['code'],
  scope: 'profile openid roles manage-user create-user',
  sessionKey: 'xui-webapp',
  tokenEndpointAuthMethod: 'client_secret_post',
  tokenURL: tokenUrl,
  useRoutes: true,
}

const baseStoreOptions = {
  cookie: {
    httpOnly: true,
    maxAge: 1800000,
    secure: showFeature(FEATURE_SECURE_COOKIE_ENABLED),
  },
  name: 'ao-webapp',
  resave: false,
  saveUninitialized: true,
  secret: getConfigValue(SESSION_SECRET),
}

const redisStoreOptions = {
  redisStore: { ...baseStoreOptions, ...{
      redisStoreOptions: {
        redisCloudUrl: getConfigValue(REDISCLOUD_URL),
        redisKeyPrefix: getConfigValue(REDIS_KEY_PREFIX),
        redisTtl: getConfigValue(REDIS_TTL),
      }
    }
  }
}

const fileStoreOptions = {
  fileStore: { ...baseStoreOptions, ...{
      fileStoreOptions: {
        filePath: getConfigValue(NOW) ? '/tmp/sessions' : '.sessions',
      }
    }
  }
}

const nodeLibOptions = {
  auth: {
    s2s: {
      microservice: getConfigValue(MICROSERVICE),
      s2sEndpointUrl: `${getConfigValue(SERVICE_S2S_PATH)}/lease`,
      s2sSecret: s2sSecret.trim()
    }
  },
  session: showFeature(FEATURE_REDIS_ENABLED) ? redisStoreOptions : fileStoreOptions
}
const type = showFeature(FEATURE_OIDC_ENABLED) ? 'oidc' : 'oauth2'
nodeLibOptions.auth[type] = options

app.use(xuiNode.configure(nodeLibOptions))


if (showFeature(FEATURE_REDIS_ENABLED)) {
  xuiNode.on(SESSION.EVENT.REDIS_CLIENT_READY, (redisClient: any) => {
    app.locals.redisClient = redisClient
    healthChecks.checks = {
      ...healthChecks.checks, ...{
        redis: healthcheck.raw(() => {
          return app.locals.redisClient.connected ? healthcheck.up() : healthcheck.down()
        }),
      },
    }
  })
  xuiNode.on(SESSION.EVENT.REDIS_CLIENT_ERROR, (error: any) => {
    logger.error('redis Client error is', error)
  })
}

app.use(errorStack)
app.use(appInsights)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

tunnel.init()

function healthcheckConfig(msUrl) {
  return healthcheck.web(`${msUrl}/health`, {
    deadline: 6000,
    timeout: 6000,
  })
}

const healthChecks = {
  checks: {
    feeAndPayApi: healthcheckConfig(getConfigValue(SERVICES_FEE_AND_PAY_PATH)),
    idamApi: healthcheckConfig(getConfigValue(SERVICES_IDAM_API_PATH)),
    idamWeb: healthcheckConfig(getConfigValue(SERVICES_IDAM_WEB)),
    rdProfessionalApi: healthcheckConfig(getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)),
    redis: () => ({status: 'UP'}),
    s2s: healthcheckConfig(getConfigValue(SERVICE_S2S_PATH)),
  },
}


healthcheck.addTo(app, healthChecks)


xuiNode.on(S2S.EVENT.AUTHENTICATE_SUCCESS, (token, req, res, next) => {
  axios.defaults.headers.common.ServiceAuthorization = token
  logger.info('Attached auth headers to request', 'token => ', token)
  next()
})

/**
 * Open Routes
 *
 * Any routes here do not have authentication attached and are therefore reachable.
 */

app.get('/external/ping', (req, res) => {
  console.log('Pong')
  res.send({
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
    // 4th set
    sessionSecret: getConfigValue(SESSION_SECRET),
    appInsightKey: getConfigValue(APP_INSIGHTS_KEY),
    // 5th set
    featureSecureCookieEnabled: showFeature(FEATURE_SECURE_COOKIE_ENABLED),
    featureAppInsightEnabled: showFeature(FEATURE_APP_INSIGHTS_ENABLED),
    featureProxyEnabled: showFeature(FEATURE_PROXY_ENABLED),
  })
})

/**
 * We are attaching authentication to all subsequent routes.
 */
app.use(attach) // its called in routes.ts - no need to call it here

/**
 * Secure Routes
 *
 */
app.use('/api', routes)
