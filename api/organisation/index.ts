import { NextFunction, Request, Response, Router } from 'express'
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
async function handleGetOrganisationsRoute(req: Request, res: Response, next: NextFunction) {
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

async function handlePutOrganisationRoute(req: Request, res: Response, next: NextFunction) {
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

/**
 * Handle Delete Organisation Route
 *
 * Request to PRD API to delete an organisation.
 *
 * @return {Promise<void>}
 */
async function handleDeleteOrganisationRoute(req: Request, res: Response, next: NextFunction) {
  if (!req.params.id) {
    res.status(400).send('Organisation id is missing')
  } else {
    try {
      const delOrganisationsUrl = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations/${req.params.id}`
      await req.http.delete(delOrganisationsUrl, req.body)
      res.status(200).send({value: 'Resource deleted successfully'})
    } catch (error) {
      const errReport = { apiError: error.data.message, apiStatusCode: error.status,
        message: 'handleDeleteOrganisationRoute error' }
      res.status(error.status).send(errReport)
    }
  }
}

/**
 * Handle Get Organisation Deletable Status Route
 *
 * Request to PRD API to get the users of an active organisation. This returns an object containing an array of
 * users, with the idamStatus property for each user either ACTIVE or PENDING.
 *
 * If there is one and only one user then this is presumed to be the superuser, and if this user's status is
 * PENDING then the organisation can be deleted. In ALL other scenarios, the organisation *cannot* be deleted.
 */
async function handleGetOrganisationDeletableStatusRoute(req: Request, res: Response, next: NextFunction) {
  if (!req.params.id) {
    res.status(400).send('Organisation id is missing')
  } else {
    try {
      const getOrganisationUsersUrl =
      `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations/${req.params.id}/users?returnRoles=false`
      const response = await req.http.get(getOrganisationUsersUrl)
      let organisationDeletable = false
      // Check that the response contains a non-zero list of users
      if (response.data.users && response.data.users.length) {
        organisationDeletable = response.data.users.length === 1 && response.data.users[0].idamStatus === 'PENDING'
      }
      res.send({
        organisationDeletable,
      })
    } catch (error) {
      const errReport = { apiError: error.data.message, apiStatusCode: error.status,
        message: 'handleGetOrganisationDeletableStatusRoute error' }
      res.status(error.status).send(errReport)
    }
  }
}

export const router = Router({ mergeParams: true })

router.get('/', handleGetOrganisationsRoute)
router.put('/:id', handlePutOrganisationRoute)
router.delete('/:id', handleDeleteOrganisationRoute)
router.get('/:id/users', handleGetOrganisationDeletableStatusRoute)

export default router
