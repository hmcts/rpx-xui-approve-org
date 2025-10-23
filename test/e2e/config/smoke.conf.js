'use strict';

// Backward-compat shim: older step defs expect '../../../config/conf_old.js'
// and access `config.config.baseUrl`. Re-export current config under `config`.
module.exports = {
  config: require('./config')
};
