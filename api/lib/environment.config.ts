import * as getenv from 'getenv'
import * as process from 'process'
import {EnvironmentConfig, EnvironmentConfigProxy, EnvironmentConfigServices} from '../interfaces/environment.config'

getenv.disableErrors()

export function getEnvConfig<T = string>(envConfig: string, envType: any = 'string', fallback?): T {
  if ((process as any).browser) {
    return fallback
  }
  return getenv[envType](envConfig, fallback)
}

export const configEnv = process ? getEnvConfig<string>('PUI_ENV', 'string', 'local') : 'local'

export function isLocal() {
  return configEnv === 'local'
}

if (!isLocal()) {
  // ensure the environment is thoroughly provided and error if not
  getenv.disableFallbacks()
  getenv.enableErrors()
}

const config: EnvironmentConfig = {
  appInsightsInstrumentationKey: getEnvConfig<string>('APPINSIGHTS_INSTRUMENTATIONKEY', 'string', 'AAAAAAAAAAAAAAAA'),
  configEnv,
  cookies: {
    token: getEnvConfig<string>('COOKIE_TOKEN', 'string', '__auth__'),
    userId: getEnvConfig<string>('COOKIE_USER_ID', 'string', '__userid__'),
  },
  exceptionOptions: {
    maxLines: getEnvConfig<number>('EXCEPTION_OPTIONS_MAX_LINES', 'int', 1),
  },
  health: {} as EnvironmentConfigServices,
  idamClient: getEnvConfig<string>('IDAM_CLIENT', 'string', 'xuiaowebapp'),
  indexUrl: getEnvConfig<string>('INDEX_URL', 'string', '/'),
  logging: getEnvConfig<string>('LOGGING', 'string', 'debug'),
  maxLogLine: getEnvConfig<number>('MAX_LOG_LINE', 'int', 80),
  microservice: getEnvConfig<string>('MICROSERVICE', 'string', 'xui_webapp'),
  now: getEnvConfig<boolean>('NOW', 'bool', false),
  oauthCallbackUrl: getEnvConfig<string>('OAUTH_CALLBACK_URL', 'string', '/oauth2/callback'),
  port: getEnvConfig<number>('PORT', 'int', 3001),
  protocol: getEnvConfig<string>('PROTOCOL', 'string', 'https'),
  proxy: {} as EnvironmentConfigProxy,
  secureCookie: getEnvConfig<boolean>('SECURE_COOKIE', 'bool', false),
  services: {
    ccdDataApi: getEnvConfig<string>('CCD_DATA_API_SERVICE', 'string', 'https://ccd-data-store-api-demo.service.core-compute-demo.internal'),
    ccdDefApi: getEnvConfig<string>('CCD_DEFINITION_API_SERVICE', 'string', 'https://ccd-definition-store-api-demo.service.core-compute-demo.internal'),
    idamApi: getEnvConfig<string>('IDAM_API_SERVICE', 'string', 'https://idam-api.aat.platform.hmcts.net'),
    idamWeb: getEnvConfig<string>('IDAM_WEB_SERVICE', 'string', 'https://idam-web-public.aat.platform.hmcts.net'),
    rdProfessionalApi: getEnvConfig<string>('RD_PROFESSIONAL_API_SERVICE', 'string', 'https://rd-professional-api-aat.service.core-compute-aat.internal'),
    s2s: getEnvConfig<string>('S2S_SERVICE', 'string', 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal'),
  },
  sessionSecret: getEnvConfig<string>('SESSION_SECRET', 'string', 'secretSauce'),
}

Object.keys(config.services).forEach(service => {
  config.health[service] = `${config.services[service]}/health`
})

const proxyConfig: EnvironmentConfigProxy = {
  host: getEnvConfig<string>('PROXY_HOST', 'string', ''),
  port: getEnvConfig<number>('PROXY_PORT', 'int', 0),
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
export default { ...config }
