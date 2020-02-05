import { createGlobalProxyAgent } from 'global-agent'
//TODO: May need to change this.
import { environmentConfig, isLocal } from './environment.config'
import * as log4jui from './log4jui'
import {exists} from './util'

const logger = log4jui.getLogger('proxy')

export function init(): void {
  if (isLocal() && exists(environmentConfig.proxy, 'host') && exists(environmentConfig.proxy, 'port')) {
    const globalProxyAgent = createGlobalProxyAgent()
    logger.info('configuring global-agent: ', environmentConfig.proxy)
    globalProxyAgent.HTTP_PROXY = `http://${environmentConfig.proxy.host}:${environmentConfig.proxy.port}`
    globalProxyAgent.NO_PROXY = 'localhost'
  }
}
