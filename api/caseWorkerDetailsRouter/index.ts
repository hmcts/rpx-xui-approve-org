import * as express from 'express'
import * as multer from 'multer'
import { getErrorResponse, getPartialSuccess, getSuccess } from './mock-error-scenarios'

const upload = multer({ dest: 'uploads/' })

async function caseWorkerDetailsRoute(req: express.Request, res: express.Response) {
  const mockErrorRes = getErrorResponse(req, res)

  if (mockErrorRes) {
    res.status(mockErrorRes.status).json(mockErrorRes.json)
    return
  }

  const partialSuccessRes = getPartialSuccess(req, res)
  if (partialSuccessRes) {
    res.send(partialSuccessRes)
  } else {
    const successRes = getSuccess()
    res.send(successRes).status(200)
  }
}

export const router = express.Router({ mergeParams: true })

router.post('/', upload.any(), caseWorkerDetailsRoute)

export default router
