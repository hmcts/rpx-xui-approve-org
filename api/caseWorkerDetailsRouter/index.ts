import { SERVICE_CASE_WORKER_PATH } from '../configuration/references'
import * as express from 'express'
import * as multer from 'multer'
import { getConfigValue } from '../configuration'
import * as FormData from 'form-data'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const multipartFormData = 'multipart/form-data'

async function caseWorkerDetailsRoute(req: multer.Request, res: express.Response, next: express.NextFunction) {
  const file = req.files[0]
  const url = getConfigValue(SERVICE_CASE_WORKER_PATH)
  const uploadUrl = `${url}/refdata/case-worker/upload-file`
  try {
    let formData = new FormData();
    formData.append('file', file.buffer, file.originalname);
    const headers = {
                      headers:  {'Content-Type': getContentType(multipartFormData, formData)}
                    }
    const {status, data} = await req.http.post(uploadUrl, formData, headers)
    res.status(status)
    res.send(data)
  } catch(error) {
    next(error)
  }
}

export function getContentType(contentType: string, formData: FormData) {
  return `${contentType}; boundary=${formData.getBoundary()}`
}

export const router = express.Router({ mergeParams: true })

router.post('/', upload.any(), caseWorkerDetailsRoute)

export default router
