import * as express from 'express'
import * as multer from 'multer'

import { getErrorResponse, getPartialSuccess } from './mock-error-scenarios'

const upload = multer({ dest: 'uploads/' })

async function caseWorkerDetailsRoute(req: express.Request, res: express.Response) {
    const mockErrorRes = getErrorResponse(req, res)
    const partialSuccess = getPartialSuccess(req, res)
    if(mockErrorRes) {
        res.status(mockErrorRes.status).json(mockErrorRes.json)
    } else if(partialSuccess) {
        res.send(partialSuccess)
    } else {
        if (req.files[0].originalname === 'fileName-200-no-details.xlsx') {
            res.send({recordsCreated: 0, recordsAmended: 0, recordsDeleted: 0, recordsFailed: 0}).status(200)
        }
        else {
            res.send({recordsCreated: 1, recordsAmended: 1, recordsDeleted: 0, recordsFailed: 0}).status(200)
        }
    }
}

export const router = express.Router({ mergeParams: true })

router.post('/', upload.any(),  caseWorkerDetailsRoute)

export default router
