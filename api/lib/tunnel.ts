import { createGlobalProxyAgent } from 'global-agent'
import {getConfigValue, getEnvironment} from '../configuration'
import {DEVELOPMENT} from '../configuration/constants'
import {HTTP_PROXY, NO_PROXY} from '../configuration/references'
import * as log4jui from './log4jui'

const logger = log4jui.getLogger('proxy')

export function init(): void {
  if (getEnvironment() === DEVELOPMENT) {
    logger.info('configuring global-agent: ', getConfigValue(HTTP_PROXY), 'no proxy:', getConfigValue(NO_PROXY))
    createGlobalProxyAgent({})
  }
}
