import * as express from 'express'
import { getConfigValue } from '../configuration'
import { APP_INSIGHTS_KEY } from '../configuration/references'
import * as log4jui from '../lib/log4jui'

const logger = log4jui.getLogger('monitoring-tools')

async function handleInstrumentationKeyRoute(req, res) {
    try {
        logger.info('environmentConfig.appInsightsInstrumentationKey is ' + getConfigValue(APP_INSIGHTS_KEY))
        res.send({key: getConfigValue(APP_INSIGHTS_KEY)})
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
