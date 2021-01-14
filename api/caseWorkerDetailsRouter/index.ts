import * as express from 'express'
import * as multer from 'multer'

import { getErrorResponse } from './mock-error-scenarios'

const upload = multer({ dest: 'uploads/' })

async function caseWorkerDetailsRoute(req: express.Request, res: express.Response) {
    const mockErrorRes = getErrorResponse(req, res)
    if(!mockErrorRes) {
        res.send({recordsCreated: 1, recordsAmended: 1, recordsDeleted: 0, recordsFailed: 0}).status(200)
    } else {
        res.status(mockErrorRes.status).json(mockErrorRes.json)
    }
}

export const router = express.Router({ mergeParams: true })

router.post('/', upload.any(),  caseWorkerDetailsRoute)

export default router
