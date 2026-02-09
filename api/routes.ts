import { xuiNode } from '@hmcts/rpx-xui-node-lib';
import * as express from 'express';
import allUserListWithoutRolesRouter from './allUserListWithoutRoles';
import caseWorkerDetailsRouter from './caseWorkerDetailsRouter';
import healthCheck from './healthCheck';
import getAppInsightsConnectionString from './monitoring-tools';
import organisationRouter from './organisation';
import pbaAccounts from './pbaAccounts';
import getLovRefDataRouter from './prd/lov';
import reinviteUserRouter from './reinviteUser';
import stateRouter from './states';
import pbaRouter from './updatePba/routes';
import userDetailsRouter from './user';
import getConfigurationUIRouter from './configurationUI';

const router = express.Router({ mergeParams: true });
// open routes
router.use('/configuration-ui', getConfigurationUIRouter);

router.use(xuiNode.authenticate);
router.use('/user', userDetailsRouter);
router.use('/decisions', stateRouter);
router.use('/healthCheck', healthCheck);
router.use('/organisations', organisationRouter);
router.use('/pba', pbaRouter);
router.use('/updatePba', pbaRouter);
router.use('/pbaAccounts', pbaAccounts);
router.use('/monitoring-tools', getAppInsightsConnectionString);
router.use('/reinviteUser', reinviteUserRouter);
router.use('/caseworkerdetails', caseWorkerDetailsRouter);
router.use('/allUserListWithoutRoles', allUserListWithoutRolesRouter);
router.use('/getLovRefData', getLovRefDataRouter);

export default router;
