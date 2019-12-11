import * as express from 'express'
import * as auth from './auth'
import healthCheck from './healthCheck'
import getappInsightsInstrumentationKey from './monitoring-tools'
import organisationRouter from './organisation'
import stateRouter from './states'

const router = express.Router({ mergeParams: true })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
router.use(auth.attach)

router.use('/logout', auth.logout)

router.use('/decisions', stateRouter)
router.use('/healthCheck', healthCheck)
router.use('/organisations', organisationRouter)

router.use('/monitoring-tools', getappInsightsInstrumentationKey)
export default router
