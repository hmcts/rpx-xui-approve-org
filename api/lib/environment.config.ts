import * as config from 'config'
import * as getenv from 'getenv'
import * as process from 'process'
import {EnvironmentConfig, EnvironmentConfigProxy, EnvironmentConfigServices} from '../interfaces/environment.config'

getenv.disableFallbacks()
getenv.enableErrors()

/**
 * Currently used to access the S2S_SECRET and IDAM_SECRET.
 *
 * [16.12.2019]
 *
 * @param {string} envConfig
 * @param envType
 * @returns {T}
 */
export function getEnvConfig<T = string>(envConfig: string, envType: any = 'string'): T {
  return getenv[envType](envConfig)
}

/**
 * Gets the current environment the Node service is running on.
 *
 * TODO: Add NODE_ENV to the terraform file, so that it is pushed to the environment.
 *
 * Note that dependent on the NODE_ENV we set which config file is used. This happens automatically
 * when using Node-config
 *
 * Check if Node-config automatically sets itself to local if there is no NODE_ENV set, if it
 * does then we don't really need this, but we would still have to change.
 *
 * configParams.protocol to be 'http'. So having the function isLocal is fine.
 *
 * This function is nice because it explains what's going on if there is no NODE_ENV set.
 *
 * @see node_modules/config
 * @returns {string}
 */
export const configEnv = process ? getEnvConfig<string>('NODE_ENV', 'string') : 'local'

/**
 * Checks if the environment is the local environment.
 *
 * @returns {boolean}
 */
export const isLocal = () => configEnv === 'local'

/**
 * environmentConfig.secureCookie
 * environmentConfig.sessionSecret
 * environmentConfig.now
 * environmentConfig.maxLogLine
 * environmentConfig.proxy
 * environmentConfig.appInsightsInstrumentationKey
 * environmentConfig.logging
 * environmentConfig.microservice
 */

/**
 * environmentConfig.services.idamApi
 * environmentConfig.cookies.token
 * environmentConfig.cookies.userId
 * environmentConfig.idamClient
 * environmentConfig.services.idamApi
 * environmentConfig.protocol
 * environmentConfig.oauthCallbackUrl
 * environmentConfig.indexUrl
 * environmentConfig.services.s2s
 * environmentConfig.microservice
 * environmentConfig.services.rdProfessionalApi
 * environmentConfig.services.rdProfessionalApi
 * environmentConfig.health[endpoint]
 *
 */
// Not needed currently
// const getHealthCheckRoutes = services => {
//
//   const map = {}
//   Object.keys(services).forEach(service => {
//     map[service] = `${services[service]}/health`
//   })
//
//   return map
// }

// So let's make sure everything hooks into this, then let's leverage this.
  // TODO: This should be tested
  // TODO: Add types

export const configParams: EnvironmentConfig = {
    appInsightsInstrumentationKey: config.get('appInsightsInstrumentationKey'),
    configEnv,
    cookies: {
      token: config.get('cookies.token'),
      userId: config.get('cookies.userId'),
    },
    exceptionOptions: {
      maxLines: config.get('exceptionOptions.maxLines'),
    },
    health: {} as EnvironmentConfigServices,
    idamClient: config.get('idamClient'),
    indexUrl: config.get('indexUrl'),
    logging: config.get('logging'),
    maxLogLine: config.get('maxLogLine'),
    microservice: config.get('microservice'),
    now: config.get('now'),
    oauthCallbackUrl: config.get('oauthCallbackUrl'),
    protocol: config.get('protocol'),
    proxy: {} as EnvironmentConfigProxy,
    secureCookie: config.get('secureCookie'),
    services: {
      ccdDataApi: config.get('services.ccdDataApi'),
      ccdDefApi: config.get('services.ccdDefApi'),
      idamApi: config.get('services.idamApi'),
      idamWeb: config.get('services.idamWeb'),
      rdProfessionalApi: config.get('services.rdProfessionalApi'),
      s2s: config.get('services.s2s'),
    },
    sessionSecret: config.get('sessionSecret'),
  }

// Get health for each service should be placed into different function
// Not easily testable + side effecting
Object.keys(configParams.services).forEach(service => {
  configParams.health[service] = `${configParams.services[service]}/health`
})

// console.log('getHealthCheckRoutes(configParams.services)')
// console.log(getHealthCheckRoutes(configParams.services))

const proxyConfig: EnvironmentConfigProxy = {
  host: config.get('proxyConfig.host'), // getEnvConfig<string>('PROXY_HOST', 'string'),
  port: config.get('proxyConfig.port'), // getEnvConfig<number>('PROXY_PORT', 'int'),
}

// Not easily testable
if (proxyConfig.host !== '' && proxyConfig.port !== 0) {
  configParams.proxy = {
    host: proxyConfig.host,
    port: proxyConfig.port,
  }
}

console.log('configParams')
console.log(configParams)

if (isLocal()) {
  configParams.protocol = 'http'
}

// TODO: As this is called first
// this throws an error, but no human readable error is returned.
export const environmentConfig = {...configParams}
