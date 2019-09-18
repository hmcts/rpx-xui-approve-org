export default {
  services: {
    ccdDataApi: 'https://ccd-data-store-api-demo.service.core-compute-demo.internal',
    ccdDefApi: 'https://ccd-definition-store-api-demo.service.core-compute-demo.internal',
    idamWeb: 'https://hmcts-access.service.gov.uk',
    idamApi: 'https://idam-api.platform.hmcts.net',
    idamLoginUrl: 'https://hmcts-access.service.gov.uk',
    s2s: 'http://rpe-service-auth-provider-prod.service.core-compute-prod.internal',
    rdProfessionalApi: 'https://rd-professional-api-prod.service.core-compute-prod.internal',
  },
  health: {
    ccdDataApi: 'https://ccd-data-store-api-demo.service.core-compute-demo.internal/health',
    ccdDefApi: 'https://ccd-definition-store-api-demo.service.core-compute-demo.internal/health',
    idamWeb: 'https://hmcts-access.service.gov.uk/health',
    idamApi: 'https://idam-api.platform.hmcts.net/health',
    idamLoginUrl: 'https://hmcts-access.service.gov.uk/health',
    s2s: 'http://rpe-service-auth-provider-prod.service.core-compute-prod.internal/health',
    rdProfessionalApi: 'https://rd-professional-api-prod.service.core-compute-prod.internal/health',
  },
    useProxy: false,
    secureCookie: true,
    sessionSecret: 'secretSauce',
}
