import { environmentConfig } from '../lib/environment.config'
import { http } from '../lib/http'
import * as log4jui from '../lib/log4jui'

const logger = log4jui.getLogger('rd-professional')

const url = environmentConfig.services.rdProfessionalApi

export async function postOrganisation(body: any): Promise<any> {
  logger.info(`Post organisation body`)
  logger.debug(JSON.stringify(body))
  const response = await http.post(`${url}/organisations`, body)
  return response.data
}
