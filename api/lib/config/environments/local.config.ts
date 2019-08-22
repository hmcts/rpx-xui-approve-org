export default {
  services: {
    ccdDataApi: 'https://ccd-data-store-api-demo.service.core-compute-demo.internal',
    ccdDefApi: 'https://ccd-definition-store-api-demo.service.core-compute-demo.internal',
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net',
    idamApi: 'https://idam-api.aat.platform.hmcts.net',
    s2s: 'http://rpe-service-auth-provider-demo.service.core-compute-demo.internal',
    rdProfessionalApi: 'https://rd-professional-api-aat.service.core-compute-aat.internal',
  },
  health: {
    ccdDataApi: 'https://ccd-data-store-api-demo.service.core-compute-demo.internal/health',
    ccdDefApi: 'https://ccd-definition-store-api-demo.service.core-compute-demo.internal/health',
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net/health',
    idamApi: 'https://idam-api.aat.platform.hmcts.net/health',
    s2s: 'http://rpe-service-auth-provider-demo.service.core-compute-demo.internal/health',
    rdProfessionalApi: 'https://rd-professional-api-aat.service.core-compute-aat.internal/health',
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
