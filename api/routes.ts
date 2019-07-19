import * as express from 'express'
import * as auth from './auth'
import getappInsightsInstrumentationKey from './monitoring-tools'
import organisationRouter from './organisation'
import stateRouter from './states'

const router = express.Router({ mergeParams: true })

router.use(auth.attach)

router.use('/logout', auth.logout)

router.use('/decisions', stateRouter)
router.use('/organisations', organisationRouter)

router.use('/monitoring-tools', getappInsightsInstrumentationKey)
export default router
