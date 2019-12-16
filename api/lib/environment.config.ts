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
    appInsightsInstrumentationKey: config.get('appInsightsInstrumentationKey'), //getEnvConfig<string>('APPINSIGHTS_INSTRUMENTATIONKEY', 'string'),
    configEnv,
    cookies: {
      token: config.get('cookies.token'), // getEnvConfig<string>('COOKIE_TOKEN', 'string'),
      userId: config.get('cookies.userId'), // getEnvConfig<string>('COOKIE_USER_ID', 'string'),
    },
    exceptionOptions: {
      maxLines: config.get('exceptionOptions.maxLines'), // getEnvConfig<number>('EXCEPTION_OPTIONS_MAX_LINES', 'int'),
    },
    health: {} as EnvironmentConfigServices,
    idamClient: config.get('idamClient'), // getEnvConfig<string>('IDAM_CLIENT', 'string'),
    indexUrl: config.get('indexUrl'), // getEnvConfig<string>('INDEX_URL', 'string'),
    logging: config.get('logging'), // getEnvConfig<string>('LOGGING', 'string'),
    maxLogLine: config.get('maxLogLine'), // getEnvConfig<number>('MAX_LOG_LINE', 'int'),
    microservice: config.get('microservice'), // getEnvConfig<string>('MICROSERVICE', 'string'),
    now: config.get('now'), // getEnvConfig<boolean>('NOW', 'bool'),
    oauthCallbackUrl: config.get('oauthCallbackUrl'), // getEnvConfig<string>('OAUTH_CALLBACK_URL', 'string'),
    protocol: config.get('protocol'), // getEnvConfig<string>('PROTOCOL', 'string'),
    proxy: {} as EnvironmentConfigProxy,
    secureCookie: config.get('secureCookie'), //getEnvConfig<boolean>('SECURE_COOKIE', 'bool'),
    services: {
      ccdDataApi: config.get('services.ccdDataApi'), //getEnvConfig<string>('CCD_DATA_API_SERVICE', 'string'),
      ccdDefApi: config.get('services.ccdDefApi'), // getEnvConfig<string>('CCD_DEFINITION_API_SERVICE', 'string'),
      idamApi: config.get('services.idamApi'), // getEnvConfig<string>('IDAM_API_SERVICE', 'string'),
      idamWeb: config.get('services.idamWeb'), // getEnvConfig<string>('IDAM_WEB_SERVICE', 'string'),
      rdProfessionalApi: config.get('services.rdProfessionalApi'), // getEnvConfig<string>('RD_PROFESSIONAL_API_SERVICE', 'string'),
      s2s: config.get('services.s2s'), // getEnvConfig<string>('S2S_SERVICE', 'string'),
    },
    sessionSecret: config.get('sessionSecret'), // getEnvConfig<string>('SESSION_SECRET', 'string'),
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

export const environmentConfig = {...configParams}
