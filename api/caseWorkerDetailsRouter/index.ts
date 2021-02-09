import * as express from 'express'
import * as multer from 'multer'
import { getConfigValue } from '../configuration'
import { SERVICE_CASE_WORKER_PATH } from '../configuration/references'
import { getFormData, getHeaders, getUploadFileUrl, MulterRequest } from './util'

const storage = multer.memoryStorage()
const upload = multer({ storage })

async function caseWorkerDetailsRoute(req: express.Response & Request, res: express.Response, next: express.NextFunction) {
  if(!req.file) {
    res.status(400)
    res.send('You need to select a file to upload. Please try again.')
  }
  const formData = getFormData(req.file)
  const headers = getHeaders(formData)
  const baseCaseWorkerUrl = getConfigValue(SERVICE_CASE_WORKER_PATH)
  const uploadUrl = getUploadFileUrl(baseCaseWorkerUrl)
  try {
    const {status, data} = await req.http.post(uploadUrl, formData, headers)
    res.status(status)
    res.send(data)
  } catch(error) {
    next(error)
  }
}

export const router = express.Router({ mergeParams: true })

router.post('/', upload.single('file'), caseWorkerDetailsRoute)

export default router
