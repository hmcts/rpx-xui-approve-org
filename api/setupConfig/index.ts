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
