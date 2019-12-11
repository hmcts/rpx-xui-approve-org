import * as config from 'config'

export const ERROR_CONFIG_PROPS = `Error: configuration properties are not set, please make sure you have the NODE_CONFIG_DIR
  setup in your environmental variables.`

/**
 * Checks if the environment has the configuration properties setup. If they are not set we throw a message back to the developer.
 * So that we give that developer feedback on how to resolve.
 *
 * @returns {string}
 */
export const checkConfigPropertiesSet = () => {

  if (!config.has('parent.child')) {
    console.log(ERROR_CONFIG_PROPS)
  }
}
