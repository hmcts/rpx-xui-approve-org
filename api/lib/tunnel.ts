import { createGlobalProxyAgent } from 'global-agent'
import {getConfigValue} from '../configuration'
import {USE_PROXY} from '../configuration/references'
import * as log4jui from './log4jui'

const logger = log4jui.getLogger('proxy')

export function init(): void {
  if (getConfigValue(USE_PROXY)) {
    logger.info('configuring global-agent: ', process.env.AO_HTTP_PROXY, ' no proxy: ', process.env.AO_NO_PROXY)
    createGlobalProxyAgent({
      environmentVariableNamespace: "AO_",
    })
  }
}
