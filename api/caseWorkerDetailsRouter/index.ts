import * as express from 'express'

async function caseWorkerDetailsRoute(req: express.Request, res: express.Response) {
    res.send({recordsCreated: 1, recordsAmended: 1, recordsDeleted: 0, recordsFailed: 0}).status(200)
}

export const router = express.Router({ mergeParams: true })

router.post('/', caseWorkerDetailsRoute)

export default router
