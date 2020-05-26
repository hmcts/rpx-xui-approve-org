import * as healthcheck from '@hmcts/nodejs-healthcheck'
import {AUTH, oauth2, oidc } from '@hmcts/rpx-xui-node-lib/dist/auth'
import axios from 'axios'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as session from 'express-session'
import * as helmet from 'helmet'
import * as auth from './auth'
import * as serviceTokenMiddleware from './auth/serviceToken'
import {havePrdAdminRole} from './auth/userRoleAuth'
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
import {getStore} from './lib/sessionStore'
import * as tunnel from './lib/tunnel'
import routes from './routes'
import serviceRouter from './services/serviceAuth'

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

app.use(
  session({
    cookie: {
      httpOnly: true,
      maxAge: 1800000,
      secure: showFeature(FEATURE_SECURE_COOKIE_ENABLED),
    },
    name: 'ao-webapp',
    resave: false,
    saveUninitialized: true,
    secret: getConfigValue(SESSION_SECRET),
    store: getStore(),
  }) as express.RequestHandler
)

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

if (showFeature(FEATURE_REDIS_ENABLED)) {
  healthChecks.checks = {
    ...healthChecks.checks, ...{
      redis: healthcheck.raw(() => {
        return app.locals.redisClient.connected ? healthcheck.up() : healthcheck.down()
      }),
    }
  }
}

healthcheck.addTo(app, healthChecks)

app.use(serviceRouter)

const secret = getConfigValue(IDAM_SECRET)
const idamClient = getConfigValue(IDAM_CLIENT)
const idamWebUrl = getConfigValue(SERVICES_IDAM_WEB)
const issuerUrl = getConfigValue(SERVICES_ISS_PATH)
const oauthCallbackUrl = getConfigValue(OAUTH_CALLBACK_URL)
const idamApiPath = getConfigValue(SERVICES_IDAM_API_PATH)

// TODO: have moved this here temporarily so we don't have to worry about invoking
app.use(async (req, res, next) => {
  await serviceTokenMiddleware.default(req, res, () => {
    logger.info('Attached auth headers to request')
    next()
  })
})

/**
 * Open Routes
 *
 * Any routes here do not have authentication attached and are therefore reachable.
 */
if (showFeature(FEATURE_OIDC_ENABLED)) {
  console.log('OIDC enabled')

  oidc.on(AUTH.EVENT.AUTHENTICATE_SUCCESS, async (isRefresh: boolean, req, res, next) => {
    console.log('req.headers =>', req.headers)
    /*console.log('havePrdAdminRole', havePrdAdminRole(roles))
    if (!havePrdAdminRole(roles)) {
      logger.warn('User role does not allow login')
      return await oidc.logout(req, res)
    }*/
    console.log('req.headers', req.headers)
    axios.defaults.headers.common.Authorization = req.headers.Authorization
    axios.defaults.headers.common['user-roles'] = req.headers['user-roles']

    console.log('isRefresh =>', isRefresh)

    if (!isRefresh) {
        return res.redirect('/')
    }
    next()
  })

  app.use(oidc.configure({
    client_id: idamClient,
    client_secret: secret,
    discovery_endpoint: `${idamWebUrl}/o`,
    issuer_url: issuerUrl,
    logout_url: idamApiPath,
    redirect_uri: 'http://localhost:3000',
    response_types: ['code'],
    scope: 'profile openid roles manage-user create-user',
    sessionKey: 'xui-webapp',
    token_endpoint_auth_method: 'client_secret_post',
    useRoutes: true,
  }))

} else {
  const tokenUrl = `${getConfigValue(SERVICES_IDAM_API_PATH)}/oauth2/token`
  const authorizationUrl = `${idamWebUrl}/login`
  console.log('tokenUrl', tokenUrl)

  oauth2.on(AUTH.EVENT.AUTHENTICATE_SUCCESS, async (isRefresh, req, res, next) => {
    console.log('AUTH2 auth success =>', req.isAuthenticated())
    const userDetails = req.session.passport.user
    console.log('passport is ', req.session.passport)
    console.log('userDetails is ', userDetails)
    const roles = userDetails.userinfo.roles
    console.log('req.session.user =>', req.session.passport.user)
    console.log('havePrdAdminRole', havePrdAdminRole(roles))
    if (!havePrdAdminRole(roles)) {
      logger.warn('User role does not allow login')
      return await oauth2.logout(req, res)
    }

    axios.defaults.headers.common.Authorization = `Bearer ${userDetails.tokenset.accessToken}`
    axios.defaults.headers.common['user-roles'] = roles.join()

    await serviceTokenMiddleware.default(req, res, () => {
      logger.info('Attached auth headers to request')
      res.redirect('/')
      next()
    })
  })

  app.use(oauth2.configure({
    authorizationURL: authorizationUrl,
    callbackURL: 'http://localhost:3000/oauth2/callback',
    clientID: idamClient,
    clientSecret: secret,
    logoutUrl: idamApiPath,
    scope: ['profile', 'openid', 'roles', 'manage-user', 'create-user', 'manage-roles'],
    sessionKey: 'xui-webapp',
    tokenURL: tokenUrl,
    useRoutes: true,
}))
}

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
// app.use(auth.attach) // its called in routes.ts - no need to call it here

/**
 * Secure Routes
 *
 */
app.use('/api', routes)
