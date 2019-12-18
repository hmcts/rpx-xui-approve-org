import * as config from 'config'
import {ENVIRONMENT, PROTOCOL} from './constants'
// import * as getenv from 'getenv'
// import * as process from 'process'
// import {EnvironmentConfig, EnvironmentConfigProxy, EnvironmentConfigServices} from '../interfaces/environment.config'

// getenv.disableFallbacks()
// getenv.enableErrors()

/**
 * Currently used to access the S2S_SECRET and IDAM_SECRET.
 *
 * [16.12.2019]
 *
 * @param {string} envConfig
 * @param envType
 * @returns {T}
 */
// export function getEnvConfig<T = string>(envConfig: string, envType: any = 'string'): T {
//   return getenv[envType](envConfig)
// }

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
// export const configEnv = process ? getEnvConfig<string>('NODE_ENV', 'string') : 'local'

/**
 * Checks if the environment is the local environment.
 *
 * @returns {boolean}
 */
// export const isLocal = () => configEnv === 'local'

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

/**
 * get Configuration Property
 *
 * @param property - ie. 'services.ccdDefApi'
 */
export const getConfigProp = property => config.get(property)

// TODO: This should come from configuration file? So as to all come from one location,
// Remember that S2S secret and one other environmental variable do not.
// Yes this should come from the config file, as Node-config sets up local if
// no NODE_ENV is set.
// TODO: check this logic.
export const isLocalEnvironment = () => !process.env.NODE_CONFIG_ENV

export const ERROR_NODE_CONFIG_ENV = `Error: NODE_CONFIG_ENV is not set. Please make sure you have the NODE_CONFIG_ENV
  setup in your environmental variables.`

/**
 * Checks if the environment has the configuration properties setup. If they are not set we throw a message back to the developer.
 * So that we give that developer feedback on how to resolve.
 *
 * TODO: We require NODE_ENV to select the config file, and NODE_CONFIG_DIR path to set the path to the config file.
 *
 * If there is no NODE_CONFIG_DIR set then 'NODE_ENV value of 'aat' did not match any deployment config file names'
 * will be thrown.
 *
 * @returns {string}
 */
export const hasNodeEnvironment = () => process.env.NODE_CONFIG_ENV

/**
 * Logs the Configuration .yaml file this environment is pointing to, for debugging purposes.
 *
 * The .yaml is selected by Node-config dependent on the NODE_ENV variable.
 *
 * If no NODE_CONFIG_ENV is set the default.yaml is used to config the application.
 * If NODE_CONFIG_ENV=aat is set the aat.yaml file is used to config the application.
 * If NODE_CONFIG_ENV=test is set the test.yaml file is used to config the application.
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
export const environmentCheckText = () => `NODE_CONFIG_ENV is set as ${process.env.NODE_CONFIG_ENV} therefore we are using the ${config.get(ENVIRONMENT)} config.`

// TODO: Can be done better, but just testing something.
export const getProtocol = () => {
  if (process.env.NODE_CONFIG_ENV === 'local') {
    return 'http'
  } else {
    return config.get(PROTOCOL)
  }
}

// TODO: As this is called first
// this throws an error, but no human readable error is returned.
// export const environmentConfig = {...configParams}
// TODO: You would have to change this at every place where environmentConfig is used.
// export const environmentConfig = getConfigParameters()

// Ok so we could just start adding functions in here, but they would be hard to test
