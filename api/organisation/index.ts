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
  // if a status is passed in the request it means we need to load the paged organisations list, filtered by the status
  if (req.query.status) {
    handleOrganisationPagingRoute(req, res, next)
  } else {
    // used to load either an individual organisation or organisation user
    try {
      const organisationsUri = getOrganisationUri(req.query.status, req.query.organisationId, req.query.usersOrgId)
      const response = await req.http.get(organisationsUri)
      logger.info('Organisations get response' + response.data)

      if (response.data.organisations) {
        res.send(response.data.organisations)
      } else {
        res.send(response.data)
      }
    } catch (error) {
      logError(res, error);
    }
  }
}

/**
 * Handle Post Organisation Route (used in Paging)
 *
 * The response object from PRD is different based on the request object.
 * In case of more than 1 organisation then we get {organisations: [{org1}, {org2}]}
 * In case of just 1 org then we get {org1}
 *
 * @param req
 * @param res - {organisations: [{org1}, {org2}]} OR {org1}
 * @param next
 */
async function handleOrganisationPagingRoute(req: Request, res: Response, next: NextFunction) {
  try {
    let responseData = null;
    const organisationsUri = getOrganisationUri(req.query.status, null, null)
    const response = await req.http.get(organisationsUri)
    logger.info('Organisation paging response' + response.data)

    if (response.data.organisations) {
      const organisations = filterOrganisations(response.data.organisations, req.body.searchRequest.search_filter);
      responseData = { organisations, total_records: organisations.length };
    } else {
      responseData = { organisations: [], total_records: 0 };
    }
    res.send(responseData);
  } catch (error) {
    logError(res, error);
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
      const errReport = {
        apiError: error.data.message, apiStatusCode: error.status,
        message: 'handlePutOrganisationRoute error'
      }
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
      res.status(200).send({ value: 'Resource deleted successfully' })
    } catch (error) {
      const errReport = {
        apiError: error.data.message, apiStatusCode: error.status,
        message: 'handleDeleteOrganisationRoute error'
      }
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
 *
 * (There is no direct PRD API call that AO users can use to check the status of a (super)user, so this is the
 * alternative.)
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
      const errReport = {
        apiError: error.data.message, apiStatusCode: error.status,
        message: 'handleGetOrganisationDeletableStatusRoute error'
      }
      res.status(error.status).send(errReport)
    }
  }
}

function filterOrganisations(orgs: any, searchFilter: string): any[] {
  const TEXT_FIELDS_TO_CHECK = ['name', 'postCode', 'sraId', 'admin'];
  if (!orgs) { return []; }
  if (!searchFilter || searchFilter === '') { return orgs; }
  searchFilter = searchFilter.toLowerCase();
  return orgs.filter((org: any) => {
    if (org) {
      for (const field of TEXT_FIELDS_TO_CHECK) {
        if (textFieldMatches(org, field, searchFilter)) {
          return true;
        }
      }
      if (org.pbaNumber) {
        for (const pbaNumber of org.pbaNumber) {
          if (pbaNumber.toLowerCase().includes(searchFilter)) {
            return true;
          }
        }
      }
      if (org.dxNumber && org.dxNumber.length > 0) {
        const dxNumber = org.dxNumber[0];
        if (dxNumber) {
          const matchesDxNumber = dxNumber.dxNumber && dxNumber.dxNumber.toLowerCase().includes(searchFilter);
          const matchesDxExchange = dxNumber.dxExchange && dxNumber.dxExchange.toLowerCase().includes(searchFilter);
          return matchesDxNumber || matchesDxExchange;
        }
      }
    }
    return false;
  });
}

function textFieldMatches(org: any, field: string, filter: string): boolean {
  return org[field] && org[field].toLowerCase().includes(filter);
}

function logError(res: Response, error: any) {
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
  const errReport = {
    apiError: error.data.message, apiStatusCode: error.status,
    message: 'handlePostOrganisationsRoute error'
  }
  res.status(500).send(errReport)
}

export const router = Router({ mergeParams: true })

router.get('/', handleGetOrganisationsRoute)
router.post('/', handleOrganisationPagingRoute)
router.put('/:id', handlePutOrganisationRoute)
router.delete('/:id', handleDeleteOrganisationRoute)
router.get('/:id/isDeletable', handleGetOrganisationDeletableStatusRoute)

export default router
