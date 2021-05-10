import { Response } from 'express';

import { handleGet } from '../common/mockService';
import { getConfigValue } from '../configuration';
import { SERVICES_RD_PROFESSIONAL_API_PATH } from '../configuration/references';
import { EnhancedRequest } from '../lib/models';
import * as mock from './pbaService.mock';

mock.init();

const API_PATH = getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH);
const ORGANISATIONS_URL = 'refdata/internal/v1/organisations';
const UPDATE_URL = 'pbas';
// EUI-3846: Note how similar the one below is to the one above.
const SET_STATUS_URL = 'pba';
const GET_STATUS_URL = 'pba';

/**
 * Gets the url for updating PBAs.
 * @param orgId The organisation ID.
 * @returns A full URL for updating PBAs.
 * e.g., .../refdata/internal/v1/organisations/12345/pbas
 */
function putUpdateUrl(orgId: string): string {
  return `${API_PATH}/${ORGANISATIONS_URL}/${orgId}/${UPDATE_URL}`;
}

/**
 * Gets the url for setting the status on PBAs.
 * @param orgId The organisation ID.
 * @returns A full URL for setting the status on PBAs.
 * e.g., .../refdata/internal/v1/organisations/12345/pba
 */
function putStatusUrl(orgId: string): string {
  return `${API_PATH}/${ORGANISATIONS_URL}/${orgId}/${SET_STATUS_URL}`;
}

/**
 * Gets the url for retrieving all PBAs with a given status.
 * @param status The status with which PBAs should be retrieved.
 * @returns A full URL for getting PBAs with a given status.
 * e.g., .../refdata/internal/v1/organisations/pba/pending
 */
function getByStatusUrl(status: string): string {
  return `${API_PATH}/${ORGANISATIONS_URL}/${GET_STATUS_URL}/${status}`;
}

/**
 * Handle Update PBA Number
 *
 * The response object from PRD is different based on the request object.
 * In case of just 1 org then we get {org1}
 *
 * @param req
 * @param res
 */
export async function handleUpdatePBARoute(req: EnhancedRequest, res: Response) {
  try {
    const { paymentAccounts, orgId } = req.body;
    await req.http.put(putUpdateUrl(orgId), { paymentAccounts });
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(error.status).send(error.data);
  }
}

/**
 * Handle setting the statuses on PBA numbers.
 * @param req
 * @param res
 */
export async function handleSetStatusPBARoute(req: EnhancedRequest, res: Response) {
  try {
    const { pbaNumbers, orgId } = req.body;
    await req.http.put(putStatusUrl(orgId), { pbaNumbers });
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(error.status).send(error.data);
  }
}

/**
 * Handle getting all PBAs with a given status.
 * @param req
 * @param res
 */
export async function handleGetPBAsByStatusRoute(req: EnhancedRequest, res: Response) {
  try {
    const pbaStatus = req.params.status;
    const { status, data } = await handleGet(getByStatusUrl(pbaStatus), req);
    res.status(status).send(data);
  } catch (error) {
    console.error(error);
    res.status(error.status).send(error.data);
  }
}
