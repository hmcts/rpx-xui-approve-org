import * as express from 'express'
import organisationRouter from './organisation'
import stateRouter from './states'

const router = express.Router({ mergeParams: true })

router.use('/decisions', stateRouter)
router.use('/organisations', organisationRouter)

export default router
