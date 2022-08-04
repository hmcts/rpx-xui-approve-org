import { NextFunction, Request, Response, Router } from 'express'
import { getConfigValue } from '../configuration'
import { SERVICES_RD_PROFESSIONAL_API_PATH } from '../configuration/references'
import * as log4jui from '../lib/log4jui'

const logger = log4jui.getLogger('return')

async function handleOrganisationUserListRoute(req: Request, res: Response, next: NextFunction) {
    try {
        const organisationsUri = getOrganisationUsersUri(req.query.usersOrgId)
        const response = await req.http.get(organisationsUri)
        logger.info('Organisations users response' + response.data)
        res.send(response.data)
    } catch (error) {
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
        const errReport = { apiError: error.data.message, apiStatusCode: error.status,
            message: 'handleOrganisationUserListRoute error' }
        res.status(500).send(errReport)
    }

}

function getOrganisationUsersUri(usersOrgId): string {
    let url = `${getConfigValue(SERVICES_RD_PROFESSIONAL_API_PATH)}/refdata/internal/v1/organisations`

    if (usersOrgId) {
      url = `${url}/${usersOrgId}/users?returnRoles=false`
    }
    return url
}

export const router = Router({ mergeParams: true })

router.get('/', handleOrganisationUserListRoute)

export default router
