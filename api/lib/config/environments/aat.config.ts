export default {
  health: {
    ccdDataApi: 'http://ccd-data-store-api-demo.service.core-compute-demo.internal/health',
    ccdDefApi: 'http://ccd-definition-store-api-demo.service.core-compute-demo.internal/health',
    idamApi: 'https://idam-api.aat.platform.hmcts.net/health',
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net/health',
    rdProfessionalApi: 'http://rd-professional-api-aat.service.core-compute-aat.internal/health',
    s2s: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal/health',
  },
  logging: 'debug',
  secureCookie: false,
  services: {
    ccdDataApi: 'http://ccd-data-store-api-demo.service.core-compute-demo.internal',
    ccdDefApi: 'http://ccd-definition-store-api-demo.service.core-compute-demo.internal',
    idamApi: 'https://idam-api.aat.platform.hmcts.net',
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net',
    rdProfessionalApi: 'http://rd-professional-api-aat.service.core-compute-aat.internal',
    s2s: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal',
  },
  sessionSecret: 'secretSauce',
  useProxy: false,
}
