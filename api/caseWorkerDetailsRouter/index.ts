import * as express from 'express'
import * as multer from 'multer'

const upload = multer({ dest: 'uploads/' })

async function caseWorkerDetailsRoute(req: express.Request, res: express.Response) {
    console.log(req.files)
    res.send({recordsCreated: 1, recordsAmended: 1, recordsDeleted: 0, recordsFailed: 0}).status(200)
}

export const router = express.Router({ mergeParams: true })

router.post('/', upload.any(),  caseWorkerDetailsRoute)

export default router
