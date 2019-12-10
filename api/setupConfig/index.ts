import * as propertiesVolume from '@hmcts/properties-volume'

/**
 * The NODE_PATH is set on each of the higher environments and it gives us the path to the
 * webserver root.
 *
 * This should be the only place within the application where process.env is used, for the rest of the application
 * we should use config.get()
 *
 * @returns {string} ie - 'D:\home\site\wwwroot'
 */
export const getNodePath = () => process.env.NODE_PATH

export const getEnvConfigProperties = () => getNodePath() + '/config'

/**
 * NODE_CONFIG_DIR environmental variable is a variable provided by Node-config to allow Node-config to be configured to point
 * to a different directory. This allows /config to be located outside of the node server directory.
 *
 * We need to leverage this as our Node service does not sit within our webserver root; it sits within /api and our
 * /config folder will sit at the root of our webserver - wwwroot.
 *
 * @see node_modules config
 */
// process.env['NODE_CONFIG_DIR'] = getEnvConfigProperties()

/**
 * Allows us to integrate the Azure key-vault flex volume, so that we are able to access Node configuration values.
 */
if (!process.env.NODE_PATH) {
  console.log('NODE_PATH is required to retrieve the configuration parameters for the application.')
}

export const init = () => {
  process.env['NODE_CONFIG_DIR'] = getEnvConfigProperties()
}

// propertiesVolume.addTo(config)

// export const init = () => {
//
//   /**
//    * Allows us to integrate the Azure key-vault flex volume, so that we are able to access Node configuration values.
//    */
//   if (!process.env.NODE_PATH) {
//     console.log('NODE_PATH is required to retrieve the configuration parameters for the application.')
//   }
//
//   process.env['NODE_CONFIG_DIR'] = getEnvConfigProperties()
//
//   import * as config from 'config'
//
//   propertiesVolume.addTo(config)
// }
