export default {
  services: {
    ccdDataApi: 'https://ccd-data-store-api-ithc.service.core-compute-ithc.internal',
    ccdDefApi: 'https://ccd-definition-store-api-ithc.service.core-compute-ithc.internal',
    idamWeb: 'https://idam-web-public.ithc.platform.hmcts.net',
    idamApi: 'https://idam-api.ithc.platform.hmcts.net',
    idamLoginUrl: 'https://idam-web-public.ithc.platform.hmcts.net',
    s2s: 'http://rpe-service-auth-provider-ithc.service.core-compute-ithc.internal',
    rdProfessionalApi: 'http://rd-professional-api-ithc.service.core-compute-ithc.internal',
  },
  health: {
    ccdDataApi: 'https://ccd-data-store-api-ithc.service.core-compute-ithc.internal/health',
    ccdDefApi: 'https://ccd-definition-store-api-ithc.service.core-compute-ithc.internal/health',
    idamWeb: 'https://idam-web-public.ithc.platform.hmcts.net/health',
    idamApi: 'https://idam-api.ithc.platform.hmcts.net/health',
    s2s: 'http://rpe-service-auth-provider-ithc.service.core-compute-ithc.internal/health',
    rdProfessionalApi: 'http://rd-professional-api-ithc.service.core-compute-ithc.internal/health',
  },
  proxy: {
    host: '172.16.0.7',
    port: 8080,
  },
  protocol: 'http',
  secureCookie: false,
  sessionSecret: 'secretSauce',
  logging: 'debug',
}
