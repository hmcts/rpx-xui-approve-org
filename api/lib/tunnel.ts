import { createGlobalProxyAgent } from 'global-agent'
import { environmentConfig, isLocal } from './environment.config'
import * as log4jui from './log4jui'
import {exists} from './util'

const logger = log4jui.getLogger('proxy')

export function init(): void {
  if (isLocal() && exists(environmentConfig.proxy, 'host') && exists(environmentConfig.proxy, 'port')) {
    logger.info('configuring global-agent: ', environmentConfig.proxy)
    process.env.GLOBAL_AGENT_HTTP_PROXY = `http://${environmentConfig.proxy.host}:${environmentConfig.proxy.port}`
    process.env.GLOBAL_AGENT_NO_PROXY = 'localhost'
    createGlobalProxyAgent({})
  }
}
