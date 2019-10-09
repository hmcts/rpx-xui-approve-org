import * as express from 'express'
import { environmentConfig } from '../lib/environment.config'

export const router = express.Router({ mergeParams: true })

router.get('/environment.config.js', environmentRoute)

async function environmentRoute(req, res) {
  const str = `(function (window) {
  window.__env = window.__env || ${JSON.stringify(environmentConfig)};
}(this));`
  res.status(200).send(str)
}

export default router
