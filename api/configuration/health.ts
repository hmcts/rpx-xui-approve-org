import {UIConfigServices} from '../interfaces/ui.config'
import {getConfigValue} from './index'
import {
  SERVICES_FEE_AND_PAY_PATH,
  SERVICE_S2S_PATH,
  SERVICES_CCD_DATA_API_PATH,
  SERVICES_CCD_DEF_API_PATH,
  SERVICES_IDAM_API_PATH,
  SERVICES_IDAM_WEB,
  SERVICES_RD_PROFESSIONAL_API_PATH,
} from './references'

export const healthEndpoints = (): UIConfigServices => {

  const HEALTH = '/health'

  return {
    ccdDataApi: getConfigValue(SERVICES_CCD_DATA_API_PATH) + HEALTH,
    ccdDefApi: getConfigValue(SERVICES_CCD_DEF_API_PATH) + HEALTH,
    feeAndPayApi: getConfigValue(SERVICES_FEE_AND_PAY_PATH) + HEALTH,
    idamApi: getConfigValue(SERVICES_IDAM_API_PATH) + HEALTH,
    idamWeb: getConfigValue(SERVICES_IDAM_WEB) + HEALTH,
    rdProfessionalApi: getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH) + HEALTH,
    s2s: getConfigValue(SERVICE_S2S_PATH) + HEALTH,
  }
}
