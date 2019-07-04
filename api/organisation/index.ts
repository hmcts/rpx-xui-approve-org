import * as express from 'express'
import { generateToken } from '../auth/serviceToken'
import { config } from '../lib/config'
import { http } from '../lib/http'


async function handleOrganisationsRoute(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const response = await http.get(`${config.services.rdProfessionalApi}/organisations`)
        console.log(response.data)
        res.send(response.data.organisations)
    } catch (error) {
        console.error(error)
        const errReport = { apiError: error.data.message, apiStatusCode: error.status, message: 'Organsiationsroute error' }
        res.status(500).send(errReport)
    }
}

export const router = express.Router({ mergeParams: true })

router.get('/', handleOrganisationsRoute)

export default router
