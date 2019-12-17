// import { environmentConfig } from '../lib/environment.config'
import { getConfigProp } from '../configuration'
import { SERVICES_RD_PROFESSIONAL_API_PATH } from '../configuration/constants'
import { http } from '../lib/http'
import * as log4jui from '../lib/log4jui'

const logger = log4jui.getLogger('rd-professional')

const url = getConfigProp(SERVICES_RD_PROFESSIONAL_API_PATH)

export async function postOrganisation(body: any): Promise<any> {
  logger.info(`Post organisation body`)
  logger.debug(JSON.stringify(body))
  const response = await http.post(`${url}/organisations`, body)
  return response.data
}
