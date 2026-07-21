import { AUTH, xuiNode } from '@hmcts/rpx-xui-node-lib';
import * as express from 'express';
import { NextFunction, Response } from 'express';
import { getConfigValue } from '../configuration';
import { COOKIE_ROLES } from '../configuration/references';
import { client } from '../lib/appInsights';
import { http } from '../lib/http';
import * as log4jui from '../lib/log4jui';
import { EnhancedRequest } from '../models/enhanced-request.interface';

// once both todo's below are complete, we can remove this file
const logger = log4jui.getLogger('auth');
const POST_AUTH_ROLE_DENIED_EVENT = 'ManageCasePostAuthRoleDenied';

interface AccessDeniedDetails {
  allowRolesRegex?: string;
  roles?: string[];
  userinfo?: {
    roleCategory?: string;
    roles?: string[];
  };
}

const successCallback = (req: EnhancedRequest, res: Response, next: NextFunction) => {
  const { roles } = req.session.passport.user.userinfo;

  res.cookie(getConfigValue(COOKIE_ROLES), roles);

  if (!req.isRefresh) {
    return res.redirect('/');
  }
  next();
};

const getUserRoles = (details?: AccessDeniedDetails): string[] => details?.roles || details?.userinfo?.roles || [];

const isCitizenUser = (details?: AccessDeniedDetails): boolean => {
  const roleCategory = details?.userinfo?.roleCategory?.toLowerCase();

  return roleCategory === 'citizen' || getUserRoles(details).some((role) => role.toLowerCase() === 'citizen');
};

export const accessDeniedCallback = (
  _req: EnhancedRequest,
  _res: Response,
  _next: NextFunction,
  details?: AccessDeniedDetails
) => {
  const requiredRoleMatcher = details?.allowRolesRegex || '';

  logger.warn(`Post-auth role denied: user has no role matching ${requiredRoleMatcher}`);

  if (client) {
    client.trackEvent({
      name: POST_AUTH_ROLE_DENIED_EVENT,
      properties: {
        isCitizen: isCitizenUser(details),
        requiredRoleMatcher,
        roles: getUserRoles(details).join(',')
      }
    });
  }
};

xuiNode.on(AUTH.EVENT.AUTHENTICATE_SUCCESS, successCallback);
xuiNode.on(AUTH.EVENT.AUTHENTICATE_ACCESS_DENIED, accessDeniedCallback);

export async function attach(req: EnhancedRequest, res: express.Response, next: express.NextFunction) {
  if (!req.http) {
    req.http = http(req);
  }
  next();
}
