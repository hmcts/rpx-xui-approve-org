export default {
  services: {
    ccdDataApi: 'http://ccd-data-store-api-aat.service.core-compute-aat.internal',
    ccdDefApi: 'http://ccd-definition-store-api-aat.service.core-compute-aat.internal',
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net',
    idamApi: 'https://idam-api.aat.platform.hmcts.net',
    s2s: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal',
    rdProfessionalApi: 'http://rd-professional-api-aat.service.core-compute-aat.internal',
    feeAndPayApi: 'http://payment-api-aat.service.core-compute-aat.internal'
  },
  health: {
    ccdDataApi: 'http://ccd-data-store-api-aat.service.core-compute-aat.internal/health',
    ccdDefApi: 'http://ccd-definition-store-api-aat.service.core-compute-aat.internal/health',
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net/health',
    idamApi: 'https://idam-api.aat.platform.hmcts.net/health',
    s2s: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal/health',
    rdProfessionalApi: 'http://rd-professional-api-aat.service.core-compute-aat.internal/health',
    feeAndPayApi: 'http://payment-api-aat.service.core-compute-aat.internal/health'
  },
  useProxy: false,
  secureCookie: false,
  sessionSecret: 'secretSauce',
  logging: 'debug',
  jurisdictions: [
    { id: 'SSCS' },
    { id: 'AUTOTEST1' },
    { id: 'DIVORCE' },
    { id: 'PROBATE' },
    { id: 'PUBLICLAW' },
    { id: 'bulkscan' },
    { id: 'BULKSCAN' },
    { id: 'IA' },
    { id: 'EMPLOYMENT' },
    { id: 'CMC' }
  ]
};
