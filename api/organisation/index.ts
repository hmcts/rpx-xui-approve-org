import { NextFunction, Response, Router } from 'express'
import { getConfigValue } from '../configuration'
import { SERVICES_RD_PROFESSIONAL_API_PATH } from '../configuration/references'
import * as log4jui from '../lib/log4jui'
import { EnhancedRequest } from '../models/enhanced-request.interface'

const logger = log4jui.getLogger('return');

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
async function handleGetOrganisationsRoute(req: EnhancedRequest, res: Response, next: NextFunction) {
  // if a search_filter is passed in the request it means we need to load the paged organisations list, filtered by the status
  if (req.query.search_filter) {
    handleOrganisationPagingRoute(req, res, next);
  } else {
    // used to load either an individual organisation or organisation user
    try {
        const organisationsUri = getOrganisationUri(req.query.status, req.query.organisationId, req.query.usersOrgId, req.query.page)
        const response = await req.http.get(organisationsUri)
        logger.info('Organisations response' + response.data)

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
async function handleOrganisationPagingRoute(req: EnhancedRequest, res: Response, next: NextFunction) {
  try {
    let responseData = null;
    const status = req.query.status;
    let response = null;
    const organisationsUri = getOrganisationUri(status, null, null, null);
    if (status && status === 'ACTIVE') {
      //const url = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations?status=ACTIVE&size=500&page=1`;
      response = await req.http.get(organisationsUri);
      //response = getActiveOrganisations(req);
    } else {
      response = await req.http.get(organisationsUri);
    }
    logger.info('Organisation paging response: ' + response.data);
    let organisations;

    if (response && response.data && response.data.organisations) {
      organisations = response.data.organisations;
    } else {
      organisations = response;
    }
    logger.info('Organisations count: ' + organisations.length);

    if (organisations) {
      const filteredOrganisations = filterOrganisations(organisations, req.body.searchRequest.search_filter);
      responseData = createPaginatedResponse(req.body.searchRequest.pagination_parameters, filteredOrganisations);
    } else {
      responseData = { organisations: [], total_records: 0 };
    }
    res.send(responseData);
  } catch (error) {
    logError(res, error);
  }
}

function getActiveOrganisationUrl(pageNumber: number, size: number): string {
  return `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations?status=ACTIVE&size=${size}&page=${pageNumber}`;
}

async function getActiveOrganisations(req: EnhancedRequest) {
  const url = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations?status=ACTIVE&size=500&page=1`;
  const response = await req.http.get(url);
  const chunkSize = 500;
  const total_records = response.data.organisations.length;
  logger.info('Organisation response count: ' + total_records);
  const chunks = Math.floor(total_records / chunkSize);
  const promise = [];
  for (let i = 0; i < chunks; i++) {
    logger.info('chunk url link', getActiveOrganisationUrl(i * chunkSize, chunkSize));
    promise.push(req.http.get(getActiveOrganisationUrl(i * chunkSize, chunkSize)));
  }
  const allActiveOrg = [];
  try {
    await Promise.all(promise).catch(err => err).then(organisations => {
      organisations.forEach(organisation=> {
        allActiveOrg.push(organisation);
      })
    })
  } catch (error) {
    logger.error(error);
    if (error.message) {
      logger.error('Error message: ' + error.message)
    }
    if (error.stack) {
      logger.error('Error stack: ' + error.stack)
    }
    if (error.code) {
      logger.error('Error code: ' + error.code)
    }
    throw error
  }
  
  return allActiveOrg;
}

function getOrganisationUri(status, organisationId, usersOrgId, pageNumber): string {
  let url = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations`

  if (status) {
      url = `${url}?status=${status}`
  }
  if (organisationId) {
      url = `${url}?id=${organisationId}`
  }
  if (usersOrgId) {
    url = `${url}/${usersOrgId}/users?size=50&page=${pageNumber}`;
  }
  return url;
}

async function handlePutOrganisationRoute(req: EnhancedRequest, res: Response, next: NextFunction) {
  if (!req.params.id) {
    res.status(400).send('Organisation id is missing');
  } else {
    try {
      const putOrganisationsUrl = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations/${req.params.id}`;
      await req.http.put(putOrganisationsUrl, req.body);
      res.status(200).send();
    } catch (error) {
      console.error(error);
      const errReport = {
        apiError: error.data.message, apiStatusCode: error.status,
        message: 'handlePutOrganisationRoute error'
      };
      res.status(500).send(errReport);
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
async function handleDeleteOrganisationRoute(req: EnhancedRequest, res: Response, next: NextFunction) {
  if (!req.params.id) {
    res.status(400).send('Organisation id is missing');
  } else {
    try {
      const delOrganisationsUrl = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations/${req.params.id}`;
      await req.http.delete(delOrganisationsUrl, req.body);
      res.status(200).send({ value: 'Resource deleted successfully' });
    } catch (error) {
      const errReport = {
        apiError: error.data.message, apiStatusCode: error.status,
        message: 'handleDeleteOrganisationRoute error'
      };
      res.status(error.status).send(errReport);
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
async function handleGetOrganisationDeletableStatusRoute(req: EnhancedRequest, res: Response, next: NextFunction) {
  if (!req.params.id) {
    res.status(400).send('Organisation id is missing');
  } else {
    try {
      const getOrganisationUsersUrl =
        `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations/${req.params.id}/users?returnRoles=false`;
      const response = await req.http.get(getOrganisationUsersUrl);
      let organisationDeletable = false;
      // Check that the response contains a non-zero list of users
      if (response.data.users && response.data.users.length) {
        organisationDeletable = response.data.users.length === 1 && response.data.users[0].idamStatus === 'PENDING';
      }
      res.send({
        organisationDeletable,
      });
    } catch (error) {
      const errReport = {
        apiError: error.data.message, apiStatusCode: error.status,
        message: 'handleGetOrganisationDeletableStatusRoute error'
      };
      res.status(error.status).send(errReport);
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

function createPaginatedResponse(paginationParameters: any, filteredOrganisations: any) {
  const startIndex = (paginationParameters.page_number - 1) * paginationParameters.page_size;
  let endIndex = startIndex + paginationParameters.page_size;
  if (endIndex > filteredOrganisations.length) {
    endIndex = filteredOrganisations.length;
  }
  const organisations = filteredOrganisations.slice(startIndex, endIndex);
  return { organisations, total_records: filteredOrganisations.length };
}

function textFieldMatches(org: any, field: string, filter: string): boolean {
  return org[field] && org[field].toLowerCase().includes(filter);
}

function logError(res: Response, error: any) {
  logger.error(`Organisations error ${error}`);
  if (error.message) {
    logger.error(`Error message: ${error.message}`);
  }
  if (error.stack) {
    logger.error(`Error stack: ${error.stack}`);
  }
  if (error.code) {
    logger.error(`Error code: ${error.code}`);
  }
  const errReport = {
    apiError: error.data.message, apiStatusCode: error.status,
    message: 'handlePostOrganisationsRoute error'
  };
  res.status(500).send(errReport);
}

export const router = Router({ mergeParams: true });

router.get('/', handleGetOrganisationsRoute);
router.post('/', handleOrganisationPagingRoute);
router.put('/:id', handlePutOrganisationRoute);
router.delete('/:id', handleDeleteOrganisationRoute);
router.get('/:id/isDeletable', handleGetOrganisationDeletableStatusRoute);

export default router;
