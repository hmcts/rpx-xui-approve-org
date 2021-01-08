import * as express from 'express'

async function caseWorkerDetailsRoute(req: express.Request, res: express.Response) {
    console.log(req.body)
    res.send(200)
}

export const router = express.Router({ mergeParams: true })

router.post('/', caseWorkerDetailsRoute)

export default router
