export default {
  services: {
    ccdDataApi: 'http://ccd-data-store-api-demo.service.core-compute-demo.internal',
    ccdDefApi: 'http://ccd-definition-store-api-demo.service.core-compute-demo.internal',
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net',
    idamApi: 'https://idam-api.aat.platform.hmcts.net',
    s2s: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal',
    rdProfessionalApi: 'http://rd-professional-api-aat.service.core-compute-aat.internal',
  },
  health: {
    ccdDataApi: 'https://ccd-data-store-api-demo.service.core-compute-demo.internal/health',
    ccdDefApi: 'https://ccd-definition-store-api-demo.service.core-compute-demo.internal/health',
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net/health',
    idamApi: 'https://idam-api.aat.platform.hmcts.net/health',
    s2s: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal/health',
    rdProfessionalApi: 'http://rd-professional-api-aat.service.core-compute-aat.internal/health',
  },
    useProxy: false,
    secureCookie: false,
    sessionSecret: 'secretSauce',
    logging: 'debug',
}
