/**
 * The setHeaders method now also adds the authorization headers when applicable
 * for better security.
 * When moving to a different proxy middleware, it is important to refactor this as well.
 */
// TODO: remove this entire file in favour of middleware/proxy.ts
import * as express from 'express';

export function setHeaders(req: express.Request): any {
  const headers: any = {};

  if (req.headers) {

    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }

    if (req.headers.accept) {
      headers.accept = req.headers.accept;
    }

    if (req.headers.experimental) {
      headers.experimental = req.headers.experimental;
    }

    if (req.headers.Authorization) {
      headers.Authorization = req.headers.Authorization;
    }

    if (req.headers['user-roles'] && req.headers['user-roles'].length) {
      headers['user-roles'] = req.headers['user-roles'];
    }

    if (req.headers.ServiceAuthorization) {
      headers.ServiceAuthorization = req.headers.ServiceAuthorization;
    }
  }

  return headers;
}
