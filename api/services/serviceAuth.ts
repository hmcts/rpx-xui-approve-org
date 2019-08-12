import { AxiosResponse } from 'axios'
import * as express from 'express'
import * as otp from 'otp'
import { config } from '../lib/config'
import { http } from '../lib/http'
import { getHealth, getInfo } from '../lib/util'

import { tunnel } from '../lib/tunnel'
import * as log4jui from '../lib/log4jui'
import {application} from '../lib/config/application.config'

const url = config.services.s2s
// const microservice = config.microservice
const microservice =  application.microservice
// const s2sSecret = process.env.S2S_SECRET || 'AAAAAAAAAAAAAAAA'
const s2sSecretunTrimmed = process.env.S2S_SECRET || 'AAAAAAAAAAAAAAAA'
const s2sSecret = s2sSecretunTrimmed.trim()

const logger = log4jui.getLogger('service auth')

export async function postS2SLease() {
  const configEnv = process ? process.env.PUI_ENV || 'local' : 'local'
  let response: AxiosResponse<any>
  console.log('PUI_ENV is now:', configEnv)
  console.log('postS2SLease url:', url)
  if (configEnv !== 'ldocker') {
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
