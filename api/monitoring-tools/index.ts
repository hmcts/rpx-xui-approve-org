import * as express from 'express'
import { config } from '../lib/config'
import * as log4jui from '../lib/log4jui'

const logger = log4jui.getLogger('monitoring-tools')

async function handleInstrumentationKeyRoute(req, res) {
    try {
        logger.info('config.appInsightsInstrumentationKey is ' + config.appInsightsInstrumentationKey)
        res.send({key: config.appInsightsInstrumentationKey})
    } catch (error) {
        const errReport = JSON.stringify({
            apiError: error,
            apiStatusCode: error.statusCode,
            message: 'List of users route error',
        })
        res.send(errReport).status(500)
    }
}

export const router = express.Router({ mergeParams: true })

router.get('/', handleInstrumentationKeyRoute)

export default router
