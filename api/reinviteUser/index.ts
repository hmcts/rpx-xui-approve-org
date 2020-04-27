import * as express from 'express'
import { getConfigValue } from '../configuration'
import { SERVICES_RD_PROFESSIONAL_API_PATH } from '../configuration/references'
import { http } from '../lib/http'
import * as log4jui from '../lib/log4jui'

const logger = log4jui.getLogger('return')

async function reinviteUserRoute(req, res) {
  const orgId = req.query.organisationId
  const payload = req.body
  try {
      const response = await http.post(`${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations/${orgId}/users/`, payload)
      logger.info('response::', response.data)
      res.send(response.data)
  } catch (error) {
      logger.info('error', error)
      const errReport = {
          apiError: error.data.errorMessage,
          apiStatusCode: error.status,
          message: error.data.errorDescription,
      }
      res.status(error.status).send(errReport)
  }
}

export const router = express.Router({ mergeParams: true })

router.post('/', reinviteUserRoute)

export default router
