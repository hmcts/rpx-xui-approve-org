/**
 * References to the configuration properties and their values contained with
 * the /config .yaml files.
 *
 * We store reference on how to extract the value from the .yaml data structure here.
 *
 * They are reference strings and therefore need to be testable.
 *
 * This file should be representative of the .yaml files in /config, and not
 * contain any additional constants. They are grouped as a representation of the .yaml structure.
 */
export const ENVIRONMENT = 'environment';
export const SERVICES_ISS_PATH = 'iss';

export const COOKIE_TOKEN = 'cookies.token';
export const COOKIES_USERID = 'cookies.userId';
export const COOKIE_ROLES = 'cookies.roles';

export const MAX_LINES = 'exceptionOptions.maxLines';

export const INDEX_URL = 'indexUrl';
export const MAX_LOG_LINE = 'maxLogLine';
export const IDAM_CLIENT = 'idamClient';
export const MICROSERVICE = 'microservice';
export const NOW = 'now';
export const OAUTH_CALLBACK_URL = 'oauthCallbackUrl';
export const PROTOCOL = 'protocol';

export const SERVICES_CCD_DATA_API_PATH = 'services.ccdDataApi';
export const SERVICES_CCD_DEF_API_PATH = 'services.ccdDefApi';
export const SERVICES_IDAM_API_PATH = 'services.idamApi';
export const SERVICES_IDAM_WEB = 'services.idamWeb';
export const SERVICES_RD_PROFESSIONAL_API_PATH = 'services.rdProfessionalApi';
export const SERVICES_FEE_AND_PAY_PATH = 'services.feeAndPayApi';
export const SERVICE_S2S_PATH = 'services.s2s';
export const SERVICE_CASE_WORKER_PATH = 'services.caseworkerApi';

export const SESSION_SECRET = 'sessionSecret';

export const LOGGING = 'logging';

export const S2S_SECRET = 'secrets.rpx.ao-s2s-client-secret';
export const IDAM_SECRET = 'secrets.rpx.ao-idam-client-secret';
export const APP_INSIGHTS_KEY = 'secrets.rpx.appinsights-instrumentationkey-ao';
export const LAUNCH_DARKLY_CLIENT_ID = 'secrets.rpx.launch-darkly-client-id';

// FEATURE TOGGLES
export const FEATURE_SECURE_COOKIE_ENABLED = 'secureCookieEnabled';
export const FEATURE_APP_INSIGHTS_ENABLED = 'appInsightsEnabled';
export const FEATURE_PROXY_ENABLED = 'proxyEnabled';
export const FEATURE_HELMET_ENABLED = 'helmetEnabled';
export const FEATURE_REDIS_ENABLED = 'redisEnabled';
export const FEATURE_OIDC_ENABLED = 'oidcEnabled';

export const HELMET = 'helmet';

// REDIS CONFIG
export const REDISCLOUD_URL = 'secrets.rpx.ao-webapp-redis-connection-string';
export const REDIS_TTL = 'redis.ttl';
export const REDIS_KEY_PREFIX = 'redis.prefix';

export const USER_TIMEOUT_IN_SECONDS = 'userTimeoutInSeconds';

// PACT
export const PACT_BROKER_URL = 'pact.brokerUrl';
export const PACT_BRANCH_NAME = 'pact.branchName';
export const PACT_CONSUMER_VERSION = 'pact.consumerVersion';
export const PACT_BROKER_USERNAME = 'pact.brokerUsername';
export const PACT_BROKER_PASSWORD = 'pact.brokerPassword';
