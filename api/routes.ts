import { xuiNode } from '@hmcts/rpx-xui-node-lib';
import * as express from 'express';

import caseWorkerDetailsRouter from './caseWorkerDetailsRouter';
import environment from './environment';
import healthCheck from './healthCheck';
import getappInsightsInstrumentationKey from './monitoring-tools';
import organisationRouter from './organisation';
import pbaAccounts from './pbaAccounts';
import reinviteUserRouter from './reinviteUser';
import stateRouter from './states';
import pbaRouter from './updatePba/routes';
import userDetailsRouter from './user';

const router = express.Router({ mergeParams: true });
// open routes
router.use('/environment', environment);

router.use(xuiNode.authenticate);
router.use('/user', userDetailsRouter);
router.use('/decisions', stateRouter);
router.use('/healthCheck', healthCheck);
router.use('/organisations', organisationRouter);
router.use('/pba', pbaRouter);
router.use('/updatePba', pbaRouter);
router.use('/pbaAccounts', pbaAccounts);
router.use('/monitoring-tools', getappInsightsInstrumentationKey);
router.use('/reinviteUser', reinviteUserRouter);
router.use('/caseworkerdetails', caseWorkerDetailsRouter);

export default router;
