import * as globalTunnel from 'global-tunnel-ng'
import { environmentConfig } from './environment.config'
import * as log4jui from './log4jui'
import {exists} from './util'

const logger = log4jui.getLogger('proxy')

export function init() {
  if (exists(environmentConfig.proxy, 'host') && exists(environmentConfig.proxy, 'port')) {
    logger.info('configuring tunnel: ', environmentConfig.proxy)
    globalTunnel.initialize({...environmentConfig.proxy})
  }
}
