import { getConfigValue } from '../configuration';
import { SERVICES_RD_PROFESSIONAL_API_PATH } from '../configuration/references';
import * as log4jui from '../lib/log4jui';
import { EnhancedRequest } from '../models/enhanced-request.interface';

const logger = log4jui.getLogger('rd-professional');

const url = getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH);

export async function postOrganisation(body: any, req: EnhancedRequest): Promise<any> {
  logger.info('Post organisation body');
  logger.debug(JSON.stringify(body));
  const response = await req.http.post(`${url}/organisations`, body);
  return response.data;
}
