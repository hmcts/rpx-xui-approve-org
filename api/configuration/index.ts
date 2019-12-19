import * as config from 'config'
import {HTTP, LOCAL} from './constants'
import {ENVIRONMENT, PROTOCOL} from './references'

/**
 * get Configuration Property
 *
 * Returns the configuration value, using a config reference. It uses the reference to pull out the value
 * from the .yaml file
 *
 * TODO: Rename to Get Configuration Value
 *
 * @see /config .yaml
 * @param reference - ie. 'services.ccdDefApi'
 */
export const getConfigProp = property => config.get(property)

/**
 * Get Secrets
 *
 * The Idam & S2S secret are not contained within our /config .yaml file.
 *
 * They are secrets and therefore contained within the Azure key vault.
 *
 * @returns {string}
 */
export const getIdamSecret = () => process.env.IDAM_SECRET

export const getS2SSecret = () => process.env.S2S_SECRET

/**
 * Checks if the environment has the configuration properties setup. If they are not set we throw a message back to the developer.
 * So that we give that developer feedback on how to resolve.
 *
 * TODO: We require NODE_ENV to select the config file, and NODE_CONFIG_DIR path to set the path to the config file.
 * TODO: Make DRY
 *
 * If there is no NODE_CONFIG_DIR set then 'NODE_ENV value of 'aat' did not match any deployment config file names'
 * will be thrown.
 *
 * @returns {string}
 */
export const getEnvironment = () => process.env.NODE_CONFIG_ENV

/**
 * Generate Environment Check Text
 *
 * We generate text to logs the Configuration .yaml file this environment is pointing to, for debugging purposes.
 *
 * The .yaml is selected by Node-config dependent on the NODE_ENV variable.
 *
 * If NODE_CONFIG_ENV is NOT set the default.yaml is defaulted to and used within the application.
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

/**
 * Get Protocol
 *
 * If running locally we return 'http'
 *
 * @returns {string | string}
 */
export const getProtocol = () => getEnvironment() === LOCAL ? HTTP : PROTOCOL
