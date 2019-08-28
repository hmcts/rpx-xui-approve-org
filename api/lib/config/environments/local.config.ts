export default {
  services: {
    ccdDataApi: 'https://ccd-data-store-api-demo.service.core-compute-demo.internal',
    ccdDefApi: 'https://ccd-definition-store-api-demo.service.core-compute-demo.internal',
    idamWeb: 'https://hmcts-access.service.gov.uk',
    idamApi: 'https://idam-api.platform.hmcts.net',
    s2s: 'https://rpe-service-auth-provider-prod.service.core-compute-prod.internal',
    rdProfessionalApi: 'https://rd-professional-api-prod.service.core-compute-prod.internal',
  },
  health: {
    ccdDataApi: 'https://ccd-data-store-api-demo.service.core-compute-demo.internal/health',
    ccdDefApi: 'https://ccd-definition-store-api-demo.service.core-compute-demo.internal/health',
    idamWeb: 'https://hmcts-access.service.gov.uk/health',
    idamApi: 'https://idam-api.platform.hmcts.net/health',
    s2s: 'https://rpe-service-auth-provider-prod.service.core-compute-prod.internal/health',
    rdProfessionalApi: 'https://rd-professional-api-prod.service.core-compute-prod.internal/health',
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
