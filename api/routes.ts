import * as express from 'express'
import * as auth from './auth'
import environment from './environment'
import healthCheck from './healthCheck'
import getAppInsightsInstrumentationKey from './monitoring-tools'
import organisationRouter from './organisation'
import pbaAccounts from './pbaAccounts'
import stateRouter from './states'
import pbaRouter from './update-pba'
import userDetailsRouter from './user'

const router = express.Router({ mergeParams: true })
// open routes
router.use('/environment', environment)
router.use('/decisions', stateRouter)
router.use('/healthCheck', healthCheck)
router.use('/organisations', organisationRouter)
router.use('/update-pba', pbaRouter)
router.use('/user', userDetailsRouter)
router.use('/pbaAccounts', pbaAccounts)

router.use('/monitoring-tools', getAppInsightsInstrumentationKey)
export default router
