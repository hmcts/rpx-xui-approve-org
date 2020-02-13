import * as config from 'config'
import {exists} from '../lib/util'
import {DEVELOPMENT, HTTP} from './constants'
import {ENVIRONMENT, PROTOCOL} from './references'

/**
 * Get Environment
 *
 * See Readme for more information on how the configuration file is set.
 * 'Environmental Variables Setup & Error Handling'
 *
 * @see Readme
 * @returns {string} ie. - development / preview / aat / ithc, prod
 */
export const getEnvironment = () => process.env.NODE_CONFIG_ENV

/**
 * Has Config Value
 *
 * Returns if the configuration value is available, using a config reference. It uses the reference to pull out the value
 * from the .yaml file
 *
 * Note: If within a .yaml file you have
 *
 * database:
 *   name: POSTGRES_DB_NAME
 *
 * If POSTGRES_DB_NAME is unable to be pulled from the JenkinsFile_CNP,
 * then .yaml will return a string of 'POSTGRES_DB_NAME'
 *
 * This means that config.has('database.name') will always return true
 * as 'database.name'.
 *
 * This also means that config.get('database.name') will return 'POSTGRES_DB_NAME' and not
 * undefined.
 *
 * We return null if the value config.get receives has not been overridden.
 *
 * Example implementation:
 * hasConfigValue('database.name', 'POSTGRES_DB_NAME')
 *
 * @see /config .yaml
 * @see references.ts
 * @param reference - ie. 'services.ccdDefApi'
 * @param shouldBeOverridden - ie. 'POSTGRES_DB_NAME'
 */
export const hasConfigValue = (reference, shouldBeOverridden) => {

  const configurationValue = config.get(reference)

  return configurationValue !== shouldBeOverridden
}

/**
 * Get Configuration Value
 *
 * Returns the configuration value, using a config reference. It uses the reference to pull out the value
 * from the .yaml file
 *
 * @see /config .yaml
 * @see references.ts
 * @param reference - ie. 'services.ccdDefApi'
 */
export const getConfigValue = reference => config.get(reference)

/**
 * Get Idam Secret
 *
 * The Idam secret is contained within the Azure Key Vault, and not within our .yaml file. All references to process.env
 * are managed from this file therefore we call process.env.IDAM_SECRET here.
 *
 * @returns {string}
 */
export const getIdamSecret = () => process.env.IDAM_SECRET

/**
 * Get S2S Secret
 *
 * We're able to pull in the S2S secret into the application using the following:
 * secretsConfig['secrets']['rpx']['mc-s2s-client-secret']
 *
 * The secret always comes from keyVaults.rpx.secrets.mc-s2s-client-secret
 * @see values.yaml
 *
 * @returns {string}
 */
export const getS2SSecret = (secretsConfig): string => {
  const ERROR_S2S_SECRET_NOT_FOUND =
    'secrets.rpx.mc-s2s-client-secret not found on this environment.'
  if (exists(secretsConfig, 'secrets.rpx.ao-s2s-client-secret')) {
    // tslint:disable-next-line: no-string-literal
    return secretsConfig['secrets']['rpx']['ao-s2s-client-secret']
  } else {
    console.log(ERROR_S2S_SECRET_NOT_FOUND)
    return ''
  }
}

/**
 * Generate Environment Check Text
 *
 * We generate text to be used for debugging purposes, so as the person attempting to initialise the application knows
 * what the NODE_CONFIG_ENV is set as and what config file is being used.
 */
export const environmentCheckText = () => `NODE_CONFIG_ENV is set as ${process.env.NODE_CONFIG_ENV} therefore we are using the ${config.get(ENVIRONMENT)} config.`

/**
 * Get Protocol
 *
 * If running locally we return 'http'
 *
 * @returns {string | string}
 */
export const getProtocol = () => getEnvironment() === DEVELOPMENT ? HTTP : getConfigValue(PROTOCOL)
