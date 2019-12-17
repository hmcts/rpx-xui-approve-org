import * as globalTunnel from 'global-tunnel-ng'
import {getConfigProp} from '../configuration'
import {PROXY_HOST, PROXY_PORT} from '../configuration/constants'
// import { environmentConfig } from './environment.config'
import * as log4jui from './log4jui'
import {exists} from './util'

const logger = log4jui.getLogger('proxy')

export function init() {

  const proxy = {
    host: getConfigProp(PROXY_HOST), //config.get('proxyConfig.host'), // getEnvConfig<string>('PROXY_HOST', 'string'),
    port: getConfigProp(PROXY_PORT), //config.get('proxyConfig.port'), // getEnvConfig<number>('PROXY_PORT', 'int'),
  }

  if (exists(proxy, 'host') && exists(proxy, 'port')) {
    logger.info('configuring tunnel: ', proxy)
    globalTunnel.initialize({...proxy})
  }
}
