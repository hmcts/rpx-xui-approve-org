// TODO: We should remove this file?
import * as getenv from 'getenv'
import * as process from 'process'
import {EnvironmentConfig, EnvironmentConfigProxy, EnvironmentConfigServices} from '../interfaces/environment.config'

getenv.disableFallbacks()
getenv.enableErrors()

export function getEnvConfig<T = string>(envConfig: string, envType: any = 'string'): T {
  return getenv[envType](envConfig)
}

export const configEnv = process ? getEnvConfig<string>('PUI_ENV', 'string') : 'local'

export function isLocal() {
  return configEnv === 'local'
}

const config: EnvironmentConfig = {
  appInsightsInstrumentationKey: getEnvConfig<string>('APPINSIGHTS_INSTRUMENTATIONKEY', 'string'),
  configEnv,
  cookies: {
    token: getEnvConfig<string>('COOKIE_TOKEN', 'string'),
    userId: getEnvConfig<string>('COOKIE_USER_ID', 'string'),
  },
  exceptionOptions: {
    maxLines: getEnvConfig<number>('EXCEPTION_OPTIONS_MAX_LINES', 'int'),
  },
  health: {} as EnvironmentConfigServices,
  idamClient: getEnvConfig<string>('IDAM_CLIENT', 'string'),
  indexUrl: getEnvConfig<string>('INDEX_URL', 'string'),
  logging: getEnvConfig<string>('LOGGING', 'string'),
  maxLogLine: getEnvConfig<number>('MAX_LOG_LINE', 'int'),
  microservice: getEnvConfig<string>('MICROSERVICE', 'string'),
  now: getEnvConfig<boolean>('NOW', 'bool'),
  oauthCallbackUrl: getEnvConfig<string>('OAUTH_CALLBACK_URL', 'string'),
  protocol: getEnvConfig<string>('PROTOCOL', 'string'),
  proxy: {} as EnvironmentConfigProxy,
  secureCookie: getEnvConfig<boolean>('SECURE_COOKIE', 'bool'),
  services: {
    ccdDataApi: getEnvConfig<string>('CCD_DATA_API_SERVICE', 'string'),
    ccdDefApi: getEnvConfig<string>('CCD_DEFINITION_API_SERVICE', 'string'),
    feeAndPayApi: getEnvConfig<string>('FEE_AND_PAY_API', 'string'),
    idamApi: getEnvConfig<string>('IDAM_API_SERVICE', 'string'),
    idamWeb: getEnvConfig<string>('IDAM_WEB_SERVICE', 'string'),
    rdProfessionalApi: getEnvConfig<string>('RD_PROFESSIONAL_API_SERVICE', 'string'),
    s2s: getEnvConfig<string>('S2S_SERVICE', 'string'),
  },
  sessionSecret: getEnvConfig<string>('SESSION_SECRET', 'string'),
}

Object.keys(config.services).forEach(service => {
  config.health[service] = `${config.services[service]}/health`
})

const proxyConfig: EnvironmentConfigProxy = {
  host: getEnvConfig<string>('PROXY_HOST', 'string'),
  port: getEnvConfig<number>('PROXY_PORT', 'int'),
}

if (proxyConfig.host !== '' && proxyConfig.port !== 0) {
  config.proxy = {
    host: proxyConfig.host,
    port: proxyConfig.port,
  }
}

if (isLocal()) {
  config.protocol = 'http'
}

export const environmentConfig = { ...config }
