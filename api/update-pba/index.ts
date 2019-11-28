import * as express from 'express'
import { environmentConfig } from '../lib/environment.config'
import { http } from '../lib/http'
import * as log4jui from '../lib/log4jui'

const logger = log4jui.getLogger('return')

/**
 * Handle Get Organisation Route
 *
 * The response object from PRD is different based on the request object.
 * In case of more than 1 organisation then we get {organisations: [{org1}, {org2}]}
 * In case of just 1 org then we get {org1}
 *
 * @param req
 * @param res - {organisations: [{org1}, {org2}]} OR {org1}
 * @param next
 */
async function handleGetOrganisationsRoute(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const organisationsUri = getOrganisationUri(req.query.status, req.query.organisationId)
        const response = await http.get(organisationsUri)
        logger.info('Organisations response' + response.data)
        if (response.data.organisations) {
            res.send(response.data.organisations)
        } else {
            res.send(response.data)
        }
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

function getOrganisationUri(status, organisationId): string {
    let url = `${environmentConfig.services.rdProfessionalApi}/refdata/internal/v1/organisations`

    if (status) {
        url = `${url}?status=${status}`
    }
    if (organisationId) {
        url = `${url}?id=${organisationId}`
    }
    console.log('url is ' + url)
    return url
}

async function handleUpdateRoute(req: express.Request, res: express.Response, next: express.NextFunction) {
      try {
          console.log('=============================================')
          const {pab1, pba2, orgId} = req.body
          const updatePbaUrl = `${environmentConfig.services.rdProfessionalApi}/refdata/internal/v1/organisations/${orgId}/pbas`
          const paymentAccounts = {paymentAccounts: [pab1, pba2]};
          console.log(paymentAccounts)
          await http.put(updatePbaUrl, paymentAccounts)
          res.status(200).send()
      } catch (error) {
          console.error(error)
          const errReport = { apiError: error.data.message, apiStatusCode: error.status,
              message: 'handlePutOrganisationRoute error' }
          res.status(500).send(errReport)
      }
}

export const router = express.Router({ mergeParams: true })

// router.get('/', handleGetOrganisationsRoute)
router.put('/', handleUpdateRoute)

export default router
