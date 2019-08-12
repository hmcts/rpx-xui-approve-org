import * as express from 'express'
import * as log4jui from '../../api/lib/log4jui'
import { config } from '../lib/config'
import { http } from '../lib/http'

const logger = log4jui.getLogger('return')

async function handleGetOrganisationsRoute(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const organisationsUri = req.query.status ?
        `${config.services.rdProfessionalApi}/refdata/internal/v1/organisations?status=${req.query.status}`
         : `${config.services.rdProfessionalApi}/organisations`
        console.log(organisationsUri)
        const response = await http.get(organisationsUri)
        res.send(response.data.organisations)
        logger.info('Organisations response' + response)
    } catch (error) {
        logger.error('Organisations error ' + error)
        if (error.message) {
            logger.error('Error message: ' + error.message)
          }
        if (error.stack) {
            logger.error('Error stack: ' + error.stack)
          }
        if (error.code) {
            logger.error('Error code: ' + error.code)
          }
        const errReport = { apiError: error.data.message, apiStatusCode: error.status,
            message: 'handleGetOrganisationsRoute error' }
        res.status(500).send(errReport)
    }
}

async function handlePutOrganisationRoute(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.params.id) {
        res.status(400).send('Organisation id is missing')
    } else {
        try {
            const putOrganisationsUrl = `${config.services.rdProfessionalApi}/refdata/internal/v1/organisations/${req.params.id}`
            await http.put(putOrganisationsUrl, req.body)
            res.status(200).send()
        } catch (error) {
            console.error(error)
            const errReport = { apiError: error.data.message, apiStatusCode: error.status,
                message: 'handlePutOrganisationRoute error' }
            res.status(500).send(errReport)
        }
    }
}

export const router = express.Router({ mergeParams: true })

router.get('/', handleGetOrganisationsRoute)
router.put('/:id', handlePutOrganisationRoute)

export default router
