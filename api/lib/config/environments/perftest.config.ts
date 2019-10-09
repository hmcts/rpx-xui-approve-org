export default {
  services: {
    ccdDataApi: 'https://ccd-data-store-api-perftest.service.core-compute-perftest.internal',
    ccdDefApi: 'https://ccd-definition-store-api-perftest.service.core-compute-perftest.internal',
    idamWeb: 'https://idam-web-public.perftest.platform.hmcts.net',
    idamApi: 'https://idam-api.perftest.platform.hmcts.net',
    s2s: 'http://rpe-service-auth-provider-perftest.service.core-compute-perftest.internal',
    rdProfessionalApi: 'https://rd-professional-api-perftest.service.core-compute-perftest.internal',
  },
  health: {
    ccdDataApi: 'https://ccd-data-store-api-perftest.service.core-compute-perftest.internal/health',
    ccdDefApi: 'https://ccd-definition-store-api-perftest.service.core-compute-perftest.internal/health',
    idamWeb: 'https://idam-web-public.perftest.platform.hmcts.net/health',
    idamApi: 'https://idam-api.perftest.platform.hmcts.net/health',
    s2s: 'http://rpe-service-auth-provider-perftest.service.core-compute-perftest.internal/health',
    rdProfessionalApi: 'https://rd-professional-api-perftest.service.core-compute-perftest.internal/health',
  },
    useProxy: false,
    secureCookie: false,
    sessionSecret: 'secretSauce',
    logging: 'debug',
}
