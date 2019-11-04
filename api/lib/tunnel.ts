import * as globalTunnel from 'global-tunnel-ng'
import * as log4js from 'log4js'
import { environmentConfig } from './environment.config'
import {exists} from './util'

export const tunnel = globalTunnel

const logger = log4js.getLogger('proxy')
logger.level = environmentConfig.logging ? environmentConfig.logging : 'OFF'

export function init() {
  if (exists(environmentConfig.proxy, 'host') && exists(environmentConfig.proxy, 'port')) {
    logger.info('configuring tunnel: ', environmentConfig.proxy)
    globalTunnel.initialize({...environmentConfig.proxy})
  }
}
