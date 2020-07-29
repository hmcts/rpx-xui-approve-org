import * as express from 'express'
import { getConfigValue } from '../configuration'
import { SERVICES_RD_PROFESSIONAL_API_PATH } from '../configuration/references'
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
        const organisationsUri = getOrganisationUri(req.query.status, req.query.organisationId, req.query.usersOrgId)
        const response = await req.http.get(organisationsUri)
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

function getOrganisationUri(status, organisationId, usersOrgId): string {
    let url = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations`

    if (status) {
        url = `${url}?status=${status}`
    }
    if (organisationId) {
        url = `${url}?id=${organisationId}`
    }
    if (usersOrgId) {
      url = `${url}/${usersOrgId}/users`
    }
    return url
}

async function handlePutOrganisationRoute(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.params.id) {
        res.status(400).send('Organisation id is missing')
    } else {
        try {
            const putOrganisationsUrl = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations/${req.params.id}`
            await req.http.put(putOrganisationsUrl, req.body)
            res.status(200).send()
        } catch (error) {
            console.error(error)
            const errReport = { apiError: error.data.message, apiStatusCode: error.status,
                message: 'handlePutOrganisationRoute error' }
            res.status(500).send(errReport)
        }
    }
}

// TODO: Should we be sending back a 500 for every error from this API, probably not.
async function handleDeleteOrganisationRoute(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.status(200).send('handleDeleteOrganisationRoute hit')
  // if (!req.params.id) {
  //   res.status(400).send('Organisation id is missing')
  // } else {
  //   try {
  //     const putOrganisationsUrl = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations/${req.params.id}`
  //     await req.http.delete(putOrganisationsUrl, req.body)
  //     res.status(200).send()
  //   } catch (error) {
  //     console.error(error)
  //     const errReport = { apiError: error.data.message, apiStatusCode: error.status,
  //       message: 'handlePutOrganisationRoute error' }
  //     res.status(500).send(errReport)
  //   }
  // }
}

export const router = express.Router({ mergeParams: true })

router.get('/', handleGetOrganisationsRoute)
router.put('/:id', handlePutOrganisationRoute)
router.delete('/:id', handleDeleteOrganisationRoute)

export default router
