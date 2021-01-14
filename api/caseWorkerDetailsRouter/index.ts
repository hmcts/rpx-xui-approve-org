import * as express from 'express'
import * as multer from 'multer'

const upload = multer({ dest: 'uploads/' })

async function caseWorkerDetailsRoute(req: express.Request, res: express.Response) {
    console.log(req.files)
    if(req.files[0].originalname === 'fileName-400.xlsx') {
        console.log('error')
        res.status(400).json({
            error_code: 400,
            status: 'BAD_REQUEST',
            error_message: 'Missing column headers',
            error_description: 'File is missing the required column headers. Please check the file',
            timestamp: Date.now()
         })
    } else {
        res.send({recordsCreated: 1, recordsAmended: 1, recordsDeleted: 0, recordsFailed: 0}).status(200)
    }
}

export const router = express.Router({ mergeParams: true })

router.post('/', upload.any(),  caseWorkerDetailsRoute)

export default router
