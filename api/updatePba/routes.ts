import * as express from 'express';

import { handleGetPBAsByStatusRoute, handlePostPBAsByStatusRoute, handleSetStatusPBARoute, handleUpdatePBARoute } from '.';
import authInterceptor from '../lib/middleware/auth';

export const router = express.Router({ mergeParams: true });

router.use(authInterceptor);
router.put('/', handleUpdatePBARoute);
router.put('/status', handleSetStatusPBARoute);
router.get('/status/:status', handleGetPBAsByStatusRoute);
router.post('/status/:status', handlePostPBAsByStatusRoute);
export default router;
