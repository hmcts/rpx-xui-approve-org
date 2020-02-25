import * as express from 'express'
import {uiConfig} from '../configuration/ui'

export const router = express.Router({mergeParams: true})

router.get('/config', environmentRoute)

/**
 * All the environmental variables are passed to the ui.
 */
async function environmentRoute(req, res) {

  res.status(200).send(uiConfig())
}

export default router
