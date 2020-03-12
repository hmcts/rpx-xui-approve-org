import { createGlobalProxyAgent } from 'global-agent'
import {showFeature} from '../configuration'
import {FEATURE_PROXY_ENABLED} from '../configuration/references'
import * as log4jui from './log4jui'

const logger = log4jui.getLogger('proxy')

export function init(): void {
  if (showFeature(FEATURE_PROXY_ENABLED)) {
    logger.info('configuring global-agent: ', process.env.AO_HTTP_PROXY, ' no proxy: ', process.env.AO_NO_PROXY)
    createGlobalProxyAgent({
      environmentVariableNamespace: "AO_",
    })
  }
}