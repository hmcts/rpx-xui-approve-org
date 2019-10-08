import * as globalTunnel from 'global-tunnel-ng'
import { environmentConfig } from './environment.config'

export const tunnel = globalTunnel

export function init() {
    globalTunnel.initialize({
        host: environmentConfig.proxy.host,
        port: environmentConfig.proxy.port,
    })
}
