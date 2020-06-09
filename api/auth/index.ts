import { AUTH, Strategy, strategyFactory } from '@hmcts/rpx-xui-node-lib'
import axios from 'axios'
import * as express from 'express'
import {logger} from '../application'
import {showFeature} from '../configuration'
import {FEATURE_OIDC_ENABLED} from '../configuration/references'
import { http } from '../lib/http'
import {havePrdAdminRole} from './userRoleAuth'

const successCallback = async (strategy: Strategy, isRefresh: boolean, req, res, next) => {
  console.log('AUTH2 auth success =>', req.isAuthenticated())
  const userDetails = req.session.passport.user
  console.log('passport is ', req.session.passport)
  console.log('userDetails is ', userDetails)
  const roles = userDetails.userinfo.roles
  console.log('req.session.user =>', req.session.passport.user)
  console.log('havePrdAdminRole', havePrdAdminRole(roles))
  if (!havePrdAdminRole(roles)) {
    logger.warn('User role does not allow login')
    return await strategy.logout(req, res)
  }

  axios.defaults.headers.common.Authorization = `Bearer ${userDetails.tokenset.accessToken}`
  axios.defaults.headers.common['user-roles'] = roles.join()

  if (!isRefresh) {
    return res.redirect('/')
  }
  next()

  /*await serviceTokenMiddleware.default(req, res, () => {
    logger.info('Attached auth headers to request')
    res.redirect('/')
    next()
  })*/
}

export const authStrategy = showFeature(FEATURE_OIDC_ENABLED) ?
  strategyFactory.getStrategy('oidc') : strategyFactory.getStrategy('oauth2')

authStrategy.on(AUTH.EVENT.AUTHENTICATE_SUCCESS, successCallback)

export async function attach(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.http) {
    req.http = http(req)
  }
  next()
}

/*
import axios, {AxiosResponse} from 'axios'
import * as express from 'express'
import { http } from '../lib/http'
import * as jwtDecode from 'jwt-decode'
import * as net from 'net'
import {Client, ClientMetadata, Issuer, Strategy, TokenSet, UserinfoResponse} from 'openid-client'
import * as passport from 'passport'
import * as path from 'path'
import {app} from '../application'
import {getConfigValue, getProtocol, showFeature} from '../configuration'
import {
  COOKIE_ROLES, COOKIE_TOKEN, COOKIES_USERID, ENVIRONMENT,
  FEATURE_OIDC_ENABLED, IDAM_CLIENT, IDAM_SECRET, INDEX_URL, OAUTH_CALLBACK_URL,
  PROTOCOL, SERVICES_IDAM_API_PATH,
  SERVICES_IDAM_WEB, SERVICES_ISS_PATH
} from '../configuration/references'
import {router as keepAlive} from '../keepalive'
import * as log4jui from '../lib/log4jui'
import { propsExist } from '../lib/objectUtilities'
import {asyncReturnOrError} from '../lib/util'
import {getUserDetails} from '../services/idam'
import {serviceTokenGenerator} from './serviceToken'
import {havePrdAdminRole} from './userRoleAuth'

const cookieToken = getConfigValue(COOKIE_TOKEN)
const cookieUserId = getConfigValue(COOKIES_USERID)
const idamWebUrl = getConfigValue(SERVICES_IDAM_WEB)
const secret = getConfigValue(IDAM_SECRET)
const idamClient = getConfigValue(IDAM_CLIENT)
const logger = log4jui.getLogger('auth')
const idamApiUrl = getConfigValue(SERVICES_IDAM_API_PATH)

export const router = express.Router({mergeParams: true})

export async function attach(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = req.session!
  const accessToken = req.cookies[getConfigValue(COOKIE_TOKEN)]

  let expired

  if (accessToken) {
    const jwtData = jwtDecode(accessToken)
    const expires = new Date(jwtData.exp).getTime()
    const now = new Date().getTime() / 1000
    expired = expires < now
  }
  if (!accessToken || expired) {
    logger.info('Auth Token expired!')
    doLogout(req, res, 401)
  } else {
    const check = await sessionChainCheck(req, res, accessToken)
    if (check) {
      logger.info('Attaching auth')
      // also use these as axios defaults
      logger.info('Using Idam Token in defaults')
     // axios.defaults.headers.common.Authorization = req.headers.Authorization
     req.http=http(req)
      const token = await asyncReturnOrError(serviceTokenGenerator(), 'Error getting s2s token', res, logger)
      if (token) {
        logger.info('Using S2S Token in defaults')

        axios.defaults.headers.common.ServiceAuthorization = token
      } else {
        logger.warn('Cannot attach S2S token ')
        await doLogout(req, res, 401)
      }
    }

    next()
  }
}

export async function getTokenFromCode(req: express.Request): Promise<AxiosResponse> {
  logger.info(`IDAM STUFF ===>> ${idamClient}:${secret}`)
  const Authorization = `Basic ${Buffer.from(`${idamClient}:${secret}`).toString('base64')}`
  const options = {
    headers: {
      Authorization,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }

  const axiosInstance = http({} as unknown as express.Request)

  logger.info('Getting Token from auth code.')

  console.log(
    `${getConfigValue(SERVICES_IDAM_API_PATH)}/oauth2/token?grant_type=authorization_code&code=${req.query.code}&redirect_uri=${
      getProtocol()
    }://${req.headers.host}${getConfigValue(OAUTH_CALLBACK_URL)}`
  )
  return axiosInstance.post(
    `${getConfigValue(SERVICES_IDAM_API_PATH)}/oauth2/token?grant_type=authorization_code&code=${req.query.code}&redirect_uri=${
      getProtocol()
    }://${req.headers.host}${getConfigValue(OAUTH_CALLBACK_URL)}`,
    {},
    options
  )
}

async function sessionChainCheck(req: express.Request, res: express.Response, accessToken: string) {
  if (!req.session.auth) {
    logger.warn('Session expired. Trying to get user details again')
    console.log(getUserDetails(accessToken, idamApiUrl))
    const userDetails = await asyncReturnOrError(getUserDetails(accessToken, idamApiUrl), 'Cannot get user details', res, logger, false)

    // if (!propsExist(userDetails, ['data', 'roles'])) {
    //   logger.warn('User does not have any access roles.')
    //   doLogout(req, res, 401)
    //   return false
    // }

    if (!havePrdAdminRole(userDetails.data.roles)) {
      logger.warn('User has no application access, as they do not have a Approve Organisations role.')
      await doLogout(req, res, 401)
      return false
    }

    if (userDetails) {
      logger.info('Setting session')
      const orgIdResponse = {
        data: {
          id: '1',
        },
      }
      req.session.auth = {
        email: userDetails.data.email,
        orgId: orgIdResponse.data.id,
        roles: userDetails.data.roles,
        token: accessToken,
        userId: userDetails.data.id,
      }
    }
  }

  if (!req.session.auth) {
    logger.warn('Auth token  expired need to log in again')
    await doLogout(req, res, 401)
    return false
  }

  return true
}

export async function oauth(req: express.Request, res: express.Response, next: express.NextFunction) {
  logger.info('starting oauth callback')
  const response = await getTokenFromCode(req)
  const accessToken = response.data.access_token

  if (accessToken) {
    // set browser cookie
    res.cookie(getConfigValue(COOKIE_TOKEN), accessToken)

    const jwtData: any = jwtDecode(accessToken)
    const expires = new Date(jwtData.exp).getTime()
    const now = new Date().getTime() / 1000
    const expired = expires < now

    if (expired) {
      logger.warn('Auth token  expired need to log in again')
      doLogout(req, res, 401)
    } else {
      const check = await sessionChainCheck(req, res, accessToken)
      if (check) {
        res.cookie(getConfigValue(COOKIE_ROLES), req.session.auth.roles)
        //req.headers.Authorization =`Bearer ${req.session.auth.token}`

        if (req.headers.ServiceAuthorization) {
          axios.defaults.headers.common.ServiceAuthorization = req.headers.ServiceAuthorization
        }

        logger.info('save session', req.session)
        req.session.save(() => {
          res.redirect(getConfigValue(INDEX_URL) || '/')
        })
      }
    }
  } else {
    logger.error('No user-profile token')
    res.redirect(getConfigValue(INDEX_URL) || '/')
  }
}

export function doLogoutOAuth2(req: express.Request, res: express.Response, status: number = 302) {
  res.clearCookie(getConfigValue(COOKIE_TOKEN))
  res.clearCookie(getConfigValue(COOKIE_ROLES))
  res.clearCookie(getConfigValue(COOKIES_USERID))
  req.session.user = null
  delete req.session.auth // delete so it does not get returned to FE
  req.session.save(() => {
    res.redirect(status, '/')
  })
}

export async function doLogout(req: express.Request, res: express.Response, status: number = 302) {
  return await showFeature(FEATURE_OIDC_ENABLED) ? doLogoutOidc(req, res, status) : doLogoutOAuth2(req, res, status)
}

export async function configureIssuer(url: string) {
  let issuer: Issuer<Client>

  logger.info('getting oidc discovery endpoint')
  issuer = await Issuer.discover(`${url}/o`)

  const metadata = issuer.metadata
  metadata.issuer = getConfigValue(SERVICES_ISS_PATH)

  return new Issuer(metadata)
}

export async function configure(req: express.Request, res: express.Response, next: express.NextFunction) {

  if (!app.locals.issuer) {
      try {
          app.locals.issuer = await configureIssuer(idamWebUrl)
          logger._logger.info('Issuer configured:', app.locals.issuer)
      } catch (error) {
          return next(error)
      }
  }

  if (!app.locals.client) {
      const clientMetadata: ClientMetadata = {
          client_id: idamClient,
          client_secret: secret,
          response_types: ['code'],
          token_endpoint_auth_method: 'client_secret_post', // The default is 'client_secret_basic'.
      }

      app.locals.client = new app.locals.issuer.Client(clientMetadata)
      logger._logger.info('Client configured:', app.locals.client)
  }

  const host = req.get('host')
  if (host.indexOf(':') > 0 ) {
      const hostwithoutPort = host.substring(0, host.indexOf(':'))
      if (net.isIP(hostwithoutPort)) {
          return next()
      }
  }

  console.log('host is', host)
  let redirectUri = path.join(host, getConfigValue(OAUTH_CALLBACK_URL))
  redirectUri = getConfigValue(PROTOCOL) + '://' + redirectUri
  console.log('redirectUri', redirectUri)

  // logger.info('configuring strategy with redirect_uri:', redirectUri)

  passport.unuse('oidc').use('oidc', new Strategy({
      client: app.locals.client,
      params: {
          prompt: 'login',
          redirect_uri: redirectUri,
          scope: 'profile openid roles manage-user create-user',
      },
      sessionKey: 'xui_webapp', // being explicit here so we can set manually on logout
      usePKCE: false, // issuer doesn't support pkce - no code_challenge_methods_supported
  }, oidcVerify))

  next()
}

export async function openIdConnectAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  passport.authenticate('oidc', (error, user, info) => {

    // TODO: give a more meaningful error to user rather than redirect back to idam
    // return next(error) would pass off to error.handler.ts to show users a proper error page etc
    if (error) {
      logger.error(error)
      // return next(error)
    }
    if (info) {
      logger.info(info)
      // return next(info)
    }
    if (!user) {
      logger._logger.info('No user found, redirecting')
      return res.redirect('/auth/login')
    }
    req.logIn(user, err => {
      if (err) {
        return next(err)
      }
      logger._logger.info('logged in user, redirecting to authCallbackSuccess')
      return openIdAuthCallbackSuccess(req, res)
    })
  })(req, res, next)
}

export function openIdAuthCallbackSuccess(req: express.Request, res: express.Response) {
  logger._logger.info('authCallbackSuccess', req.session)

  // we need extra logic before success redirect
  const userDetails = req.session.passport.user
  const roles = userDetails.userinfo.roles

  axios.defaults.headers.common.Authorization = `Bearer ${userDetails.tokenset.access_token}`
  axios.defaults.headers.common['user-roles'] = roles.join()

  res.cookie(cookieUserId, userDetails.userinfo.uid)
  res.cookie(cookieToken, userDetails.tokenset.access_token)
  res.cookie('roles', roles)

  // need this so angular knows which enviroment config to use ...
  res.cookie('platform', getConfigValue(ENVIRONMENT))

  res.redirect('/')
}

export async function oidcVerify(tokenset: TokenSet, userinfo: UserinfoResponse, done: any) {

  if (!propsExist(userinfo, ['roles'])) {
      logger.warn('User does not have any access roles.')
      return done(null, false, {message: 'User does not have any access roles.'})
  }
  logger._logger.info('verify okay, user:', userinfo)
  return done(null, {tokenset, userinfo})
}

export async function doLogoutOidc(req: express.Request, res: express.Response, status = 302) {

  try {
    const access_token = req.session.passport.user.tokenset.access_token
    const refresh_token = req.session.passport.user.tokenset.refresh_token

    logger._logger.info('deleting tokens')

    // we need this to revoke the access/refresh_token, however it is a legacy endpoint for oauth2
    // endSessionUrl endpoint above would be much more appropriate
    const auth = `Basic ${Buffer.from(`${idamClient}:${secret}`).toString('base64')}`
    await req.http.delete(`${idamApiUrl}/session/${access_token}`, {
      headers: {
        Authorization: auth,
      },
    })
    await req.http.delete(`${idamApiUrl}/session/${refresh_token}`, {
      headers: {
        Authorization: auth,
      },
    })

    logger._logger.info('deleting auth headers')
    // Don't forget this has now moved!
    delete axios.defaults.headers.common.Authorization
    delete axios.defaults.headers.common['user-roles']

    res.clearCookie('roles')
    res.clearCookie(cookieToken)
    res.clearCookie(cookieUserId)

    //passport provides this method on request object
    req.logout()

    if (!req.query.noredirect && (req.query.redirect || status === 401)) {  // 401 is when no accessToken
      res.redirect(status, '/')
      logger.info('Logged out by userDetails')
    } else {
      const message = JSON.stringify({message: 'You have been logged out!'})
      res.status(200).send(message)
      logger.info('Logged out by Session')
    }

  } catch (e) {
    logger.error('error during logout', e)
    res.redirect(status, '/')
  }
}

// if (showFeature(FEATURE_OIDC_ENABLED)) {
//   console.log('test123')
//   router.get('/logout', async (req: express.Request, res: express.Response) => {
//     await doLogoutOidc(req, res)
//   })
//   router.get('/login', (req, res, next) => {
//     logger._logger.info('hit /login', req.session)
//     passport.authenticate('oidc')(req, res, next)
//   })
//   router.use('/keepalive', keepAlive)
// }
*/
