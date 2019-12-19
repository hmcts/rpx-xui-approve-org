import * as globalTunnel from 'global-tunnel-ng'
import {getConfigProp} from '../configuration'
import {PROXY_HOST, PROXY_PORT} from '../configuration/references'
import * as log4jui from './log4jui'
import {exists} from './util'

const logger = log4jui.getLogger('proxy')

export function init() {

  const proxy = {
    host: getConfigProp(PROXY_HOST),
    port: getConfigProp(PROXY_PORT),
  }

  if (exists(proxy, 'host') && exists(proxy, 'port')) {
    logger.info('configuring tunnel: ', proxy)
    globalTunnel.initialize({...proxy})
  }
}
