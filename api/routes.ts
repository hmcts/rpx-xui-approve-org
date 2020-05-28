import { strategyFactory } from '@hmcts/rpx-xui-node-lib/dist/auth'
import * as express from 'express'
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
  const oidc = strategyFactory.getStrategy('oidc')
  router.use('/user', oidc.authenticate, userDetailsRouter)
  router.use('/decisions', oidc.authenticate, stateRouter)
  router.use('/healthCheck', oidc.authenticate, healthCheck)
  router.use('/organisations', oidc.authenticate, organisationRouter)
  router.use('/updatePba', oidc.authenticate, pbaRouter)
  router.use('/pbaAccounts', oidc.authenticate, pbaAccounts)
  router.use('/monitoring-tools', oidc.authenticate, getappInsightsInstrumentationKey)
  router.use('/reinviteUser', oidc.authenticate, reinviteUserRouter )
} else {
    const oauth2 = strategyFactory.getStrategy('oauth2')
    router.use(oauth2.authenticate)
    router.use('/user', userDetailsRouter)
    router.use('/decisions', stateRouter)
    router.use('/healthCheck', healthCheck)
    router.use('/organisations', organisationRouter)
    router.use('/updatePba', pbaRouter)
    router.use('/pbaAccounts', pbaAccounts)
    router.use('/monitoring-tools', getappInsightsInstrumentationKey)
    router.use('/reinviteUser', reinviteUserRouter )
}

export default router
