export default {
  services: {
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net',
    idamApi: 'https://idam-api.aat.platform.hmcts.net',
    s2s: 'https://rpe-service-auth-provider-aat.service.core-compute-aat.internal',
  },
  health: {
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net/health',
    idamApi: 'https://idam-api.aat.platform.hmcts.net/health',
    s2s: 'https://rpe-service-auth-provider-aat.service.core-compute-aat.internal/health',
  },
  proxy: {
    host: '172.16.0.7',
    port: 8080,
  },
  protocol: 'http',
  secureCookie: false,
  sessionSecret: 'secretSauce',
  logging: 'debug'
};
