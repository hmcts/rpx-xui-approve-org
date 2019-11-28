import * as express from 'express'
import { environmentConfig } from '../lib/environment.config'
import { http } from '../lib/http'
/**
 * Handle Update PBA Number
 *
 * The response object from PRD is different based on the request object.
 * In case of just 1 org then we get {org1}
 *
 * @param req
 * @param res
 * @param next
 */

async function handleUpdatePBARoute(req: express.Request, res: express.Response, next: express.NextFunction) {
      try {
          const {paymentAccounts, orgId} = req.body
          const updatePbaUrl = `${environmentConfig.services.rdProfessionalApi}/refdata/internal/v1/organisations/${orgId}/pbas`
          await http.put(updatePbaUrl, {paymentAccounts})
          res.status(200).send()
      } catch (error) {
          console.error(error)
          const errReport = { apiError: error.data.errorMessage, apiStatusCode: error.status,
              message: 'handleUpdatePBARoute error' }
          res.status(error.status).send(errReport)
      }
}

export const router = express.Router({ mergeParams: true })

router.put('/', handleUpdatePBARoute)

export default router
