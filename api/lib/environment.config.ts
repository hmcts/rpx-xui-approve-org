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
export const getHealthCheckRoutes = services => {

  const map = {}
  Object.keys(services).forEach(service => {
    map[service] = `${services[service]}/health`
  })

  return map
}

const getServices = () => {

  const CCD_DATA_API_CONFIG_REF = 'services.ccdDataApi'

  return {
    ccdDataApi: config.get(CCD_DATA_API_CONFIG_REF),
    ccdDefApi: config.get('services.ccdDefApi'),
    idamApi: config.get('services.idamApi'),
    idamWeb: config.get('services.idamWeb'),
    rdProfessionalApi: config.get('services.rdProfessionalApi'),
    s2s: config.get('services.s2s'),
  }
}

// TODO : Rename
const getProxyConfiguration = () => {
  return {
    host: config.get('proxyConfig.host'),
    port: config.get('proxyConfig.port'),
  }
}

// So let's make sure everything hooks into this, then let's leverage this.
// TODO: This should be tested
// TODO: Add types

export const getConfigParameters = (): EnvironmentConfig => {

  const services = getServices()
  const healthEndpoints = getHealthCheckRoutes(services)

  const proxyConfig = getProxyConfiguration()

  const configObject = {
    appInsightsInstrumentationKey: config.get('appInsightsInstrumentationKey'),
    configEnv,
    cookies: {
      token: config.get('cookies.token'),
      userId: config.get('cookies.userId'),
    },
    exceptionOptions: {
      maxLines: config.get('exceptionOptions.maxLines'),
    },
    health: healthEndpoints as EnvironmentConfigServices,
    idamClient: config.get('idamClient'),
    indexUrl: config.get('indexUrl'),
    logging: config.get('logging'),
    maxLogLine: config.get('maxLogLine'),
    microservice: config.get('microservice'),
    now: config.get('now'),
    oauthCallbackUrl: config.get('oauthCallbackUrl'),
    protocol: config.get('protocol'),
    proxy: proxyConfig as EnvironmentConfigProxy,
    secureCookie: config.get('secureCookie'),
    services,
    sessionSecret: config.get('sessionSecret'),
  }

  return configObject
}

// export const configParams: EnvironmentConfig = {
//   appInsightsInstrumentationKey: config.get('appInsightsInstrumentationKey'),
//   configEnv,
//   cookies: {
//     token: config.get('cookies.token'),
//     userId: config.get('cookies.userId'),
//   },
//   exceptionOptions: {
//     maxLines: config.get('exceptionOptions.maxLines'),
//   },
//   health: {} as EnvironmentConfigServices,
//   idamClient: config.get('idamClient'),
//   indexUrl: config.get('indexUrl'),
//   logging: config.get('logging'),
//   maxLogLine: config.get('maxLogLine'),
//   microservice: config.get('microservice'),
//   now: config.get('now'),
//   oauthCallbackUrl: config.get('oauthCallbackUrl'),
//   protocol: config.get('protocol'),
//   proxy: {} as EnvironmentConfigProxy,
//   secureCookie: config.get('secureCookie'),
//   services: {
//     ccdDataApi: config.get('services.ccdDataApi'),
//     ccdDefApi: config.get('services.ccdDefApi'),
//     idamApi: config.get('services.idamApi'),
//     idamWeb: config.get('services.idamWeb'),
//     rdProfessionalApi: config.get('services.rdProfessionalApi'),
//     s2s: config.get('services.s2s'),
//   },
//   sessionSecret: config.get('sessionSecret'),
// }

// Get health for each service should be placed into different function
// Not easily testable + side effecting
// Object.keys(configParams.services).forEach(service => {
//   configParams.health[service] = `${configParams.services[service]}/health`
// })

// console.log('getHealthCheckRoutes(configParams.services)')
// console.log(getHealthCheckRoutes(configParams.services))

// const proxyConfig: EnvironmentConfigProxy = {
//   host: config.get('proxyConfig.host'), // getEnvConfig<string>('PROXY_HOST', 'string'),
//   port: config.get('proxyConfig.port'), // getEnvConfig<number>('PROXY_PORT', 'int'),
// }

// Not easily testable
// if (proxyConfig.host !== '' && proxyConfig.port !== 0) {
//   configParams.proxy = {
//     host: proxyConfig.host,
//     port: proxyConfig.port,
//   }
// }

console.log('configParams')
console.log(configParams)

if (isLocal()) {
  configParams.protocol = 'http'
}

export const ERROR_CONFIG_PROPS = `Error: configuration properties are not set, please make sure you have the NODE_CONFIG_DIR
  setup in your environmental variables.`

/**
 * Checks if the environment has the configuration properties setup. If they are not set we throw a message back to the developer.
 * So that we give that developer feedback on how to resolve.
 *
 * @returns {string}
 */
export const checkConfigPropertiesSet = () => {

  console.log('checkConfigPropertiesSet')
  if (!config.has('environment')) {
    console.log(ERROR_CONFIG_PROPS)
  }
}

/**
 * Logs the Configuration .yaml file this environment is pointing to, for debugging purposes.
 *
 * The .yaml is selected by Node-config dependent on the NODE_ENV variable.
 *
 * If no NODE_ENV is set the default.yaml is used to config the application.
 * If NODE_ENV=aat is set the aat.yaml file is used to config the application.
 * If NODE_ENV=test is set the test.yaml file is used to config the application.
 * etc.
 *
 * Important note: We never place local.yaml file into the /config folder as it overrides all other config files
 * on that environment.
 *
 * If a config property does not exist in a config file, the property in the default.yaml file is used. The default.yaml
 * file should be reflective of the values on production, so that we do not accidentally break production.
 *
 * @see https://github.com/lorenwest/node-config/wiki/Configuration-Files #local files
 */
export const checkEnvironment = () => {

  console.log(`NODE_ENV is set as ${process.env.NODE_ENV} therefore using we are using the ${config.get('environment')} config.`)
}

// TODO: As this is called first
// this throws an error, but no human readable error is returned.
// export const environmentConfig = {...configParams}
// TODO: You would have to change this at every place where environmentConfig is used.
export const environmentConfig = getConfigParameters()

// Ok so we could just start adding functions in here, but they would be hard to test
