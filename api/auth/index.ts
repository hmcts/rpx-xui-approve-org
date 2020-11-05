import { AUTH, xuiNode } from '@hmcts/rpx-xui-node-lib'
import * as express from 'express'
import { NextFunction, Request, Response } from 'express'
import {getConfigValue} from '../configuration'
import {COOKIE_ROLES} from '../configuration/references'
import { http } from '../lib/http'

//TODO: once both todo's below are complete, we can remove this file

const successCallback = (req: Request, res: Response, next: NextFunction) => {
  const { roles } = req.session.passport.user.userinfo

  //TODO: remove dependency on the roles cookie, can then remove this event handler entirely
  res.cookie(getConfigValue(COOKIE_ROLES), roles)

  if (!req.isRefresh) {
    return res.redirect('/')
  }
  next()
}

xuiNode.on(AUTH.EVENT.AUTHENTICATE_SUCCESS, successCallback)

export async function attach(req: express.Request, res: express.Response, next: express.NextFunction) {
  //TODO: req now has req.headers.Authorization/ServiceAuthorization, so might be worthwhile replacing this in future
  if (!req.http) {
    req.http = http(req)
  }
  next()
}
