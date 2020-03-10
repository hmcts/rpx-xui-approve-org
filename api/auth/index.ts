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
  SERVICES_ISS
} from '../configuration/references'
import { http } from '../lib/http'
import * as log4jui from '../lib/log4jui'
import {propsExist} from '../lib/objectUtilities'

export const router = Router({mergeParams: true})

const cookieToken = getConfigValue(COOKIE_TOKEN)
const cookieUserId = getConfigValue(COOKIES_USERID)

const idamUrl = getConfigValue(SERVICES_IDAM_API_PATH)

const secret = getConfigValue(IDAM_SECRET)
const idamClient = getConfigValue(IDAM_CLIENT)
const logger = log4jui.getLogger('auth')

export async function configureIssuer(url: string) {
    let issuer: Issuer<Client>

    logger.info('getting oidc discovery endpoint')
    issuer = await Issuer.discover(`${url}/o`)

    const metadata = issuer.metadata
    metadata.issuer = getConfigValue(SERVICES_ISS)

    return new Issuer(metadata)
}

export async function configure(req: Request, res: Response, next: NextFunction) {

    const host = req.get('host')
    const fqdn = req.protocol + '://' + host

    // we don't want to configure strategy if coming from direct IP address (e.g. could be health endpoint)
    if (net.isIP(host)) {
        return next()
    }

    // if client is already configured, exit early
    if (app.locals.client) {
        return next()
    }

    if (!app.locals.issuer) {
        try {
            app.locals.issuer = await configureIssuer(idamUrl)
        } catch (error) {
            return next(error)
        }
    }
    logger.info('fqdn: ', fqdn)

    const clientMetadata: ClientMetadata = {
        client_id: idamClient,
        client_secret: secret,
        post_logout_redirect_uris: [`${fqdn}/auth/login`],
        redirect_uris: [`${fqdn}${getConfigValue(OAUTH_CALLBACK_URL)}`],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_post', // The default is 'client_secret_basic'.
    }

    app.locals.client = new app.locals.issuer.Client(clientMetadata)

    logger.info('configuring strategy')

    passport.use('oidc', new Strategy({
        client: app.locals.client,
        params: {scope: 'profile openid roles manage-user create-user'},
        sessionKey: 'xui_webapp', // being explicit here so we can set manually on logout
        usePKCE: false, // issuer doesn't support pkce - no code_challenge_methods_supported
    }, oidcVerify))

    next()

    // passport.use('s2s', new BearerStrategy())
}

export async function doLogout(req: Request, res: Response, status = 302) {

    req.query.redirect = app.locals.client.endSessionUrl({
        id_token_hint: req.session.passport.user.tokenset.id_token,
        // TODO: we can generate a random state and use that
        // post_logout_redirect_uri: app.locals.client.authorizationUrl({ state: 'testState' })
    })

    delete axios.defaults.headers.common.Authorization
    delete axios.defaults.headers.common['user-roles']

    res.clearCookie('roles')
    res.clearCookie(cookieToken)
    res.clearCookie(cookieUserId)

    //passport provides this method on request object
    req.logout()

    req.session.destroy( () => {
        if (req.query.redirect || status === 401) {  // 401 is when no accessToken
            res.redirect(status, req.query.redirect || '/')
            console.log('Logged out by userDetails')
        } else {
            const message = JSON.stringify({message: 'You have been logged out!'})
            res.status(200).send(message)
            console.log('Logged out by Session')
        }
    })
}

export async function oidcVerify(tokenset: TokenSet, userinfo: UserinfoResponse, done: any) {

    if (!propsExist(userinfo, ['roles'])) {
        logger.warn('User does not have any access roles.')
        return done(null, false, {message: 'User does not have any access roles.'})
    }

    return done(null, {tokenset, userinfo})
}

export function authCallbackSuccess(req: Request, res: Response) {
    // console.log('callback', req.session)

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

router.get('/logout', (req: Request, res: Response) => {
    doLogout(req, res)
})

router.get('/login', passport.authenticate('oidc'))

router.use('/keepalive', keepAlive)
