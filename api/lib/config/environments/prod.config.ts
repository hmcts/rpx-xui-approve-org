export default {
  services: {
    ccdDataApi: 'http://ccd-data-store-api-demo.service.core-compute-demo.internal',
    ccdDefApi: 'http://ccd-definition-store-api-demo.service.core-compute-demo.internal',
    idamWeb: 'https://hmcts-access.service.gov.uk',
    idamApi: 'https://idam-api.platform.hmcts.net',
    idamLoginUrl: 'https://hmcts-access.service.gov.uk',
    s2s: 'http://rpe-service-auth-provider-prod.service.core-compute-prod.internal',
    rdProfessionalApi: 'http://rd-professional-api-prod.service.core-compute-prod.internal',
  },
  health: {
    ccdDataApi: 'http://ccd-data-store-api-demo.service.core-compute-demo.internal/health',
    ccdDefApi: 'http://ccd-definition-store-api-demo.service.core-compute-demo.internal/health',
    idamWeb: 'https://hmcts-access.service.gov.uk/health',
    idamApi: 'https://idam-api.platform.hmcts.net/health',
    idamLoginUrl: 'https://hmcts-access.service.gov.uk/health',
    s2s: 'http://rpe-service-auth-provider-prod.service.core-compute-prod.internal/health',
    rdProfessionalApi: 'http://rd-professional-api-prod.service.core-compute-prod.internal/health',
  },
    useProxy: false,
    secureCookie: true,
    sessionSecret: 'secretSauce',
}
