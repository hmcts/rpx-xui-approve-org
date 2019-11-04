import * as express from 'express'
import { environmentConfig } from '../lib/environment.config'

export const router = express.Router({ mergeParams: true })

router.get('/config', environmentRoute)

async function environmentRoute(req, res) {
  const config = { ...environmentConfig }
  delete config.appInsightsInstrumentationKey
  res.status(200).send(config)
}

export default router
