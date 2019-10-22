import * as express from 'express'
import { environmentConfig } from '../lib/environment.config'

export const router = express.Router({ mergeParams: true })

router.get('/config', environmentRoute)

async function environmentRoute(req, res) {
  res.status(200).send(environmentConfig)
}

export default router
