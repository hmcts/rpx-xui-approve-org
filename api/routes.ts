import * as express from 'express'
import * as auth from './auth'
import environment from './environment'
import healthCheck from './healthCheck'
import getappInsightsInstrumentationKey from './monitoring-tools'
import organisationRouter from './organisation'
import pbaAccounts from './pbaAccounts'
import reinviteUserRouter from './reinviteUser'
import stateRouter from './states'
import pbaRouter from './updatePba'

const router = express.Router({ mergeParams: true })
// open routes
router.use('/environment', environment)

router.use(auth.attach)

router.use('/decisions', stateRouter)
router.use('/healthCheck', healthCheck)
router.use('/organisations', organisationRouter)
router.use('/updatePba', pbaRouter)
router.use('/pbaAccounts', pbaAccounts)
router.use('/monitoring-tools', getappInsightsInstrumentationKey)
router.use('/reinviteUser', reinviteUserRouter )
export default router
