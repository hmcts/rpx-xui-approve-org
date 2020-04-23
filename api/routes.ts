import * as express from 'express'
import authInterceptor from '../api/middleware/auth'
import * as auth from './auth'
import { showFeature } from './configuration'
import { FEATURE_OIDC_ENABLED } from './configuration/references'
import environment from './environment'
import healthCheck from './healthCheck'
import getappInsightsInstrumentationKey from './monitoring-tools'
import organisationRouter from './organisation'
import pbaAccounts from './pbaAccounts'
import reinviteUserRouter from './reinviteUser'
import stateRouter from './states'
import pbaRouter from './updatePba'
import userDetailsRouter from './user'

const router = express.Router({ mergeParams: true })
// open routes
router.use('/environment', environment)

if (showFeature(FEATURE_OIDC_ENABLED)) {
  router.use(authInterceptor)
} else {
    router.use(auth.attach)
}

router.use('/user', userDetailsRouter)
router.use('/decisions', stateRouter)
router.use('/healthCheck', healthCheck)
router.use('/organisations', organisationRouter)
router.use('/updatePba', pbaRouter)
router.use('/pbaAccounts', pbaAccounts)
router.use('/monitoring-tools', getappInsightsInstrumentationKey)
router.use('/reinviteUser', reinviteUserRouter )
export default router
