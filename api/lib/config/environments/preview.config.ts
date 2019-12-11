export default {
    services: {
        ccdDataApi: 'https://ccd-data-store-api-aat.service.core-compute-aat.internal',
        ccdDefApi: 'https://ccd-definition-store-api-aat.service.core-compute-aat.internal',
        idamWeb: 'https://idam-web-public.preview.platform.hmcts.net',
        idamApi: 'https://idam-api.preview.platform.hmcts.net',
        idamLoginUrl: 'https://idam-web-public.preview.platform.hmcts.net',
        s2s: 'https://rpe-service-auth-provider-aat.service.core-compute-aat.internal',
        rdProfessionalApi: 'https://rd-professional-api-aat.service.core-compute-aat.internal',
    },
    health: {
        ccdDataApi: 'https://ccd-data-store-api-aat.service.core-compute-aat.internal/health',
        ccdDefApi: 'https://ccd-definition-store-api-aat.service.core-compute-aat.internal/health',
        idamWeb: 'https://idam-web-public.preview.platform.hmcts.net/health',
        idamApi: 'https://idam-api.preview.platform.hmcts.net/health',
        s2s: 'https://rpe-service-auth-provider-aat.service.core-compute-aat.internal/health',
        rdProfessionalApi: 'https://rd-professional-api-aat.service.core-compute-aat.internal/health',
    },
    useProxy: false,
    secureCookie: false,
    sessionSecret: 'secretSauce',
    logging: 'debug',
}
