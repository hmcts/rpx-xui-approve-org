import { getConfigValue } from '../configuration'
import { SERVICES_RD_PROFESSIONAL_API_PATH } from '../configuration/references'
import {Request} from 'express'
import * as log4jui from '../lib/log4jui'

const logger = log4jui.getLogger('rd-professional')

const url = getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)

export async function postOrganisation(body: any, req: Request): Promise<any> {
  logger.info(`Post organisation body`)
  logger.debug(JSON.stringify(body))
  const response = await req.http.post(`${url}/organisations`, body)
  return response.data
}
