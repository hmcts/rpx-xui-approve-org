import axios from 'axios'
import { NextFunction, Request, Response, Router } from 'express'
import * as net from 'net'
import {Client, ClientMetadata, Issuer, Strategy, TokenSet, UserinfoResponse} from 'openid-client'
import * as passport from 'passport'
import {app} from '../application'
import { getConfigValue } from '../configuration'
import {router as keepAlive} from '../keepalive'

import {
  COOKIE_TOKEN,
  COOKIES_USERID,
  ENVIRONMENT,
  IDAM_CLIENT,
  IDAM_SECRET,
  INDEX_URL, OAUTH_CALLBACK_URL,
  PROTOCOL,
  SERVICES_IDAM_API_PATH,
  SERVICES_IDAM_WEB,
  SERVICES_ISS_PATH
} from '../configuration/references'
import {http} from '../lib/http'
import * as log4jui from '../lib/log4jui'
import {propsExist} from '../lib/objectUtilities'

export const router = Router({mergeParams: true})

const cookieToken = getConfigValue(COOKIE_TOKEN)
const cookieUserId = getConfigValue(COOKIES_USERID)

const idamUrl = getConfigValue(SERVICES_IDAM_WEB)
const idamApiUrl = getConfigValue(SERVICES_IDAM_API_PATH)

const secret = getConfigValue(IDAM_SECRET)
const idamClient = getConfigValue(IDAM_CLIENT)
const logger = log4jui.getLogger('auth')

export async function configureIssuer(url: string) {
    let issuer: Issuer<Client>

    logger.info('getting oidc discovery endpoint')
    issuer = await Issuer.discover(`${url}/o`)

    const metadata = issuer.metadata
    metadata.issuer = getConfigValue(SERVICES_ISS_PATH)

    return new Issuer(metadata)
}

export async function configure(req: Request, res: Response, next: NextFunction) {

    if (!app.locals.issuer) {
        try {
            app.locals.issuer = await configureIssuer(idamUrl)
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
    const fqdn = getConfigValue(PROTOCOL) + '://' + host
    const redirectUri = `${fqdn}/${getConfigValue(OAUTH_CALLBACK_URL)}`
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

export async function doLogout(req: Request, res: Response, status = 302) {

    /*req.query.redirect = app.locals.client.endSessionUrl({
        id_token_hint: req.session.passport.user.tokenset.id_token,
        // TODO: we can generate a random state and use that
        // post_logout_redirect_uri: app.locals.client.authorizationUrl({ state: 'testState' })
    })*/

    try {
      const access_token = req.session.passport.user.tokenset.access_token
      const refresh_token = req.session.passport.user.tokenset.refresh_token

      logger._logger.info('deleting tokens')

      // we need this to revoke the access/refresh_token, however it is a legacy endpoint for oauth2
      // endSessionUrl endpoint above would be much more appropriate
      const auth = `Basic ${Buffer.from(`${idamClient}:${secret}`).toString('base64')}`
      await http.delete(`${idamApiUrl}/session/${access_token}`, {
        headers: {
          Authorization: auth,
        },
      })
      await http.delete(`${idamApiUrl}/session/${refresh_token}`, {
        headers: {
          Authorization: auth,
        },
      })

      logger._logger.info('deleting auth headers')
      delete axios.defaults.headers.common.Authorization
      delete axios.defaults.headers.common['user-roles']

      res.clearCookie('roles')
      res.clearCookie(cookieToken)
      res.clearCookie(cookieUserId)

      //passport provides this method on request object
      req.logout()

      if (!req.query.noredirect && (req.query.redirect || status === 401)) {  // 401 is when no accessToken
        res.redirect(status, req.query.redirect || '/')
        logger.info('Logged out by userDetails')
      } else {
        const message = JSON.stringify({message: 'You have been logged out!'})
        res.status(200).send(message)
        logger.info('Logged out by Session')
      }

    } catch (e) {
      logger.error('error during logout', e)
      res.redirect(status, req.query.redirect || '/')
    }
}

export async function oidcVerify(tokenset: TokenSet, userinfo: UserinfoResponse, done: any) {

    if (!propsExist(userinfo, ['roles'])) {
        logger.warn('User does not have any access roles.')
        return done(null, false, {message: 'User does not have any access roles.'})
    }
    logger._logger.info('verify okay, user:', userinfo)
    return done(null, {tokenset, userinfo})
}

export function authCallbackSuccess(req: Request, res: Response) {
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

router.get('/logout', async (req: Request, res: Response) => {
    await doLogout(req, res)
})

router.get('/login', (req, res, next) => {
  logger._logger.info('hit /login', req.session)
  passport.authenticate('oidc')(req, res, next)
})

router.use('/keepalive', keepAlive)
