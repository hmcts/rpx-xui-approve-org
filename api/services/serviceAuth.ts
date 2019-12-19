import { AxiosResponse } from 'axios'
import * as express from 'express'
import * as otp from 'otp'
import * as log4jui from '../lib/log4jui'
import { http } from '../lib/http'
import { getHealth, getInfo } from '../lib/util'

import { getConfigProp, getS2SSecret } from '../configuration'
import { MICROSERVICE, SERVICE_S2S_PATH } from '../configuration/constants'

const url = getConfigProp(SERVICE_S2S_PATH)

const s2sSecretUnTrimmed = getS2SSecret()
const microservice = getConfigProp(MICROSERVICE)
const s2sSecret = s2sSecretUnTrimmed.trim()

const logger = log4jui.getLogger('service auth')

export async function postS2SLease() {
  let response: AxiosResponse<any>
  console.log('NODE_CONFIG_ENV is now:', process.env.NODE_CONFIG_ENV)
  console.log('postS2SLease url:', url)
  if (process.env.NODE_CONFIG_ENV !== 'ldocker') {
    try {
      const oneTimePassword = otp({secret: s2sSecret}).totp()
      logger.info('generating from secret  :', s2sSecret, microservice, oneTimePassword)
      response = await http.post(`${url}/lease`, {
        microservice,
        oneTimePassword,
      })
      logger.info('Generated from secret: ' + response)
    } catch (error) {
      logger.error(error)
      logger.error('Some error adn')
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
    return response.data
  }
}
export const router = express.Router({ mergeParams: true })

router.get('/health', (req, res, next) => {
    res.status(200).send(getHealth(url))
})

router.get('/info', (req, res, next) => {
    res.status(200).send(getInfo(url))
})
export default router
