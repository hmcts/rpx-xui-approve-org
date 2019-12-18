import { AxiosResponse } from 'axios'
import * as express from 'express'
import * as otp from 'otp'
import * as log4jui from '../lib/log4jui'
// import {configEnv, environmentConfig, getEnvConfig} from '../lib/environment.config'
import { http } from '../lib/http'
import { getHealth, getInfo } from '../lib/util'

import { getConfigProp } from '../configuration'
import { MICROSERVICE, SERVICE_S2S_PATH } from '../configuration/constants'

const url = getConfigProp(SERVICE_S2S_PATH) // environmentConfig.services.s2s

// TODO: This directly accesses the environment variable S2S_SECRET, is this still required?
const s2sSecretUnTrimmed = process.env.S2S_SECRET // getEnvConfig<string>('S2S_SECRET', 'string')
const microservice = getConfigProp(MICROSERVICE) //environmentConfig.microservice
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
