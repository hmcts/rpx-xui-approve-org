import * as healthcheck from '@hmcts/nodejs-healthcheck'
import oidc from '@hmcts/rpx-xui-node-lib/dist/auth/oidc'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as session from 'express-session'
import * as helmet from 'helmet'
import * as passport from 'passport'
import * as auth from './auth'
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
  SESSION_SECRET,
  IDAM_SECRET
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
    name: 'jui-webapp',
    resave: true,
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
  healthChecks.checks = {...healthChecks.checks, ...{
    redis: healthcheck.raw(() => {
      return app.locals.redisClient.connected ? healthcheck.up() : healthcheck.down()
    }),
  }}
}

healthcheck.addTo(app, healthChecks)

app.use(serviceRouter)

/**
 * Open Routes
 *
 * Any routes here do not have authentication attached and are therefore reachable.
 */
if (showFeature(FEATURE_OIDC_ENABLED)) {
  console.log('OIDC enabled')
  // app.use(passport.initialize())
  // app.use(passport.session())
  // app.use(auth.configure)
  // passport.serializeUser((user, done) => {
  //   done(null, user)
  // })

  // passport.deserializeUser((id, done) => {
  //   done(null, id)
  // })
  // app.get('/oauth2/callback', auth.openIdConnectAuth)
  // app.use('/auth', auth.router)
  const secret = getConfigValue(IDAM_SECRET)
  const idamClient = getConfigValue(IDAM_CLIENT)
  const idamWebUrl = getConfigValue(SERVICES_IDAM_WEB)
  const issuerUrl = getConfigValue(SERVICES_ISS_PATH)
  const oauthCallbackUrl = getConfigValue(OAUTH_CALLBACK_URL)
  app.use(oidc.configure({
    client_id: idamClient,
    client_secret: secret,
    discovery_endpoint: `${idamWebUrl}/o`,
    issuer_url: issuerUrl,
    redirect_uri: oauthCallbackUrl,
    response_types: ['code'],
    scope: 'profile openid roles manage-user create-user',
    token_endpoint_auth_method: 'client_secret_post',
  }))
  app.get('/api/isAuthenticated', (req, res) => {
    return res.send(req.isAuthenticated())
  })
} else {
  app.get('/oauth2/callback', auth.oauth)
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
app.get('/api/logout', async (req, res) => {
  await auth.doLogout(req, res)
})
