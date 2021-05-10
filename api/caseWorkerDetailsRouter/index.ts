import * as express from 'express'
import * as multer from 'multer'
import { getConfigValue } from '../configuration'
import { SERVICE_CASE_WORKER_PATH } from '../configuration/references'
import { fieldName, getFormData, getHeaders, getUploadFileUrl } from './util'

const storage = multer.memoryStorage()
const upload = multer({ storage })

async function caseWorkerDetailsRoute(req: any, res: express.Response) {
  if (!req.file) {
    res.status(400)
    res.send('You need to select a file to upload. Please try again.')
    return
  }
  const formData = getFormData(req.file)
  const headers = getHeaders(formData)
  const baseCaseWorkerUrl = getConfigValue(SERVICE_CASE_WORKER_PATH)
  const uploadUrl = getUploadFileUrl(baseCaseWorkerUrl)
  try {
    const {status, data} = await req.http.post(uploadUrl, formData, headers)
    res.status(status)
    res.send(data)
  } catch (error) {
    if (error.status) {
      res.status(error.status)
    }
    if (error.data) {
      res.send(error.data)
    }
  }
}

export const router = express.Router({ mergeParams: true })

router.post('/', upload.single(fieldName), caseWorkerDetailsRoute)

export default router
