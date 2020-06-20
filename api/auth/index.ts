import { AUTH, Strategy, xuiNode } from '@hmcts/rpx-xui-node-lib'
import axios from 'axios'
import * as express from 'express'
import { NextFunction, Request, Response } from 'express'
import {logger} from '../application'
import {getConfigValue} from '../configuration'
import {COOKIE_ROLES} from '../configuration/references'
import { http } from '../lib/http'
import {havePrdAdminRole} from './userRoleAuth'

const successCallback = async (strategy: Strategy, isRefresh: boolean, req: Request, res: Response, next: NextFunction) => {
  const userDetails = req.session.passport.user
  const roles = userDetails.userinfo.roles
  if (!havePrdAdminRole(roles)) {
    logger.warn('User role does not allow login')
    return await strategy.logout(req, res)
  }

  axios.defaults.headers.common.Authorization = `Bearer ${userDetails.tokenset.accessToken}`
  axios.defaults.headers.common['user-roles'] = roles.join()
  res.cookie(getConfigValue(COOKIE_ROLES), roles)

  if (!isRefresh) {
    return res.redirect('/')
  }
  next()
}

xuiNode.on(AUTH.EVENT.AUTHENTICATE_SUCCESS, successCallback)

export async function attach(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.http) {
    req.http = http(req)
  }
  next()
}
