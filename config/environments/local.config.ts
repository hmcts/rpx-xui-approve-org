export default {
    services: {
      idam_web: 'https://idam-web-public.aat.platform.hmcts.net',
      idam_api: 'https://idam-api.aat.platform.hmcts.net',
        s2s: 'https://rpe-service-auth-provider-aat.service.core-compute-aat.internal'
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
