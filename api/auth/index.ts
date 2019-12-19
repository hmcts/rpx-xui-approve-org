import axios, { AxiosResponse } from 'axios'
import * as express from 'express'
import * as jwtDecode from 'jwt-decode'
import { getConfigProp, getIdamSecret, getProtocol } from '../configuration'
import {COOKIE_TOKEN, COOKIES_USERID, IDAM_CLIENT, INDEX_URL, OAUTH_CALLBACK_URL, SERVICES_IDAM_API_PATH} from '../configuration/references'
import { http } from '../lib/http'
import * as log4jui from '../lib/log4jui'
import { EnhancedRequest } from '../lib/models'
import { asyncReturnOrError } from '../lib/util'
import { getUserDetails } from '../services/idam'
import { serviceTokenGenerator } from './serviceToken'

const idamUrl = getConfigProp(SERVICES_IDAM_API_PATH)

const secret = getIdamSecret()
const logger = log4jui.getLogger('auth')

export async function attach(req: EnhancedRequest, res: express.Response, next: express.NextFunction) {
    const session = req.session!
    const accessToken = req.cookies[getConfigProp(COOKIE_TOKEN)]

    let expired

    if (accessToken) {
        const jwtData = jwtDecode(accessToken)
        const expires = new Date(jwtData.exp as string).getTime()
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
            axios.defaults.headers.common.Authorization = `Bearer ${session.auth.token}`

            const token = await asyncReturnOrError(serviceTokenGenerator(), 'Error getting s2s token', res, logger)
            if (token) {
                logger.info('Using S2S Token in defaults')
                axios.defaults.headers.common.ServiceAuthorization = token
            } else {
                logger.warn('Cannot attach S2S token ')
                doLogout(req, res, 401)
            }
        }

        next()
    }
}

export async function getTokenFromCode(req: express.Request, res: express.Response): Promise<AxiosResponse> {
    console.log(`${getConfigProp(IDAM_CLIENT)}:${secret}`)
    const Authorization = `Basic ${new Buffer(`${getConfigProp(IDAM_CLIENT)}:${secret}`).toString('base64')}`
    const options = {
        headers: {
            Authorization,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }

    logger.info('Getting Token from auth code.')

    const url = `${getConfigProp(SERVICES_IDAM_API_PATH)}/oauth2/token?grant_type=authorization_code&code=${req.query.code}&redirect_uri=${
      getProtocol()
  }://${req.headers.host}${getConfigProp(OAUTH_CALLBACK_URL)}`

    return http.post(url, {}, options)
}

async function sessionChainCheck(req: EnhancedRequest, res: express.Response, accessToken: string) {
    if (!req.session.auth) {
        logger.warn('Session expired. Trying to get user details again')
        console.log(getUserDetails(accessToken, idamUrl))
        const details = await asyncReturnOrError(getUserDetails(accessToken, idamUrl), 'Cannot get user details', res, logger, false)

        if (details) {
            logger.info('Setting session')

            //const orgIdResponse = await getOrganisationId(details)
            // no real end point
            const orgIdResponse = {
                data: {
                    id: '1',
                },
            }
            req.session.auth = {
                email: details.data.email,
                orgId: orgIdResponse.data.id,
                roles: details.data.roles,
                token: accessToken,
                userId: details.data.id,
            }
        }
    }

    if (!req.session.auth) {
        logger.warn('Auth token  expired need to log in again')
        doLogout(req, res, 401)
        return false
    }

    return true
}

export function havePrdAdminRole(userData) {
  return userData.data.roles.indexOf('prd-admin') === -1
}

export async function oauth(req: EnhancedRequest, res: express.Response, next: express.NextFunction) {
    const response = await getTokenFromCode(req, res)
    const accessToken = response.data.access_token

    if (accessToken) {
        const userDetails = await asyncReturnOrError(getUserDetails(accessToken, idamUrl), 'Cannot get user details', res, logger, false)
        const isPrdAdminRole = havePrdAdminRole(userDetails)
        if (isPrdAdminRole) {
            console.log('THIS USER CAN NOT LOGIN');
            // tslint:disable-next-line
            res.redirect(`${getConfigProp(SERVICES_IDAM_API_PATH)}/login?response_type=code&client_id=${getConfigProp(IDAM_CLIENT)}&redirect_uri=${getProtocol()}://${req.headers.host}/oauth2/callback&scope=profile openid roles manage-user create-user manage-roles`)
            return false
        }
        // set browser cookie
        res.cookie(getConfigProp(COOKIE_TOKEN), accessToken)

        const jwtData: any = jwtDecode(accessToken)
        const expires = new Date(jwtData.exp as string).getTime()
        const now = new Date().getTime() / 1000
        const expired = expires < now

        if (expired) {
            logger.warn('Auth token  expired need to log in again')
            doLogout(req, res, 401)
        } else {
            const check = await sessionChainCheck(req, res, accessToken)
            if (check) {
              axios.defaults.headers.common.Authorization = `Bearer ${req.session.auth.token}`
              axios.defaults.headers.common['user-roles'] = req.session.auth.roles

              if (req.headers.ServiceAuthorization) {
                axios.defaults.headers.common.ServiceAuthorization = req.headers.ServiceAuthorization
              }

              logger.info('save session', req.session)
              req.session.save(() => {
                res.redirect(getConfigProp(INDEX_URL) || '/')
              })
            }
        }
    } else {
        logger.error('No auth token')
        res.redirect(getConfigProp(INDEX_URL) || '/')
    }
}

export function doLogout(req: EnhancedRequest, res: express.Response, status: number = 302) {
    res.clearCookie(getConfigProp(COOKIE_TOKEN))
    res.clearCookie(getConfigProp(COOKIES_USERID))
    req.session.user = null
    req.session.save(() => {
        res.redirect(status, req.query.redirect || '/')
    })
}

export function logout(req, res) {
    doLogout(req, res, 200)
}
