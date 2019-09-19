export default {
    services: {
        ccdDataApi: 'https://ccd-data-store-api-aat.service.core-compute-aat.internal',
        ccdDefApi: 'https://ccd-definition-store-api-aat.service.core-compute-aat.internal',
<<<<<<< HEAD
        idamWeb: 'https://idam-web-public.ithc.platform.hmcts.net',
        idamApi: 'https://idam-api.ithc.platform.hmcts.net',
        s2s: 'https://rpe-service-auth-provider-aat.service.core-compute-aat.internal',
=======
        idamWeb: 'https://idam-web-public.aat.platform.hmcts.net',
        idamApi: 'https://idam-api.aat.platform.hmcts.net',
        s2s: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal',
>>>>>>> 76b169b1241c325a8dff1c91ce70f01849fef2ee
        draftStoreApi: 'https://draft-store-service-aat.service.core-compute-aat.internal',
        dmStoreApi: 'https://dm-store-aat.service.core-compute-aat.internal',
        emAnnoApi: 'https://em-anno-aat.service.core-compute-aat.internal',
        emNpaApi: 'https://em-npa-aat.service.core-compute-aat.internal',
        cohCorApi: 'https://coh-cor-aat.service.core-compute-aat.internal',
        rdProfessionalApi: 'https://rpa-rd-professional-aat.service.core-compute-aat.internal',
    },
    health: {
        ccdDataApi: 'https://ccd-data-store-api-aat.service.core-compute-aat.internal/health',
        ccdDefApi: 'https://ccd-definition-store-api-aat.service.core-compute-aat.internal/health',
        idamWeb: 'https://idam-web-public.aat.platform.hmcts.net/health',
        idamApi: 'https://idam-api.aat.platform.hmcts.net/health',
        s2s: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal/health',
        draftStoreApi: 'https://draft-store-service-aat.service.core-compute-aat.internal/health',
        dmStoreApi: 'https://dm-store-aat.service.core-compute-aat.internal/health',
        emAnnoApi: 'https://em-anno-aat.service.core-compute-aat.internal/health',
        emNpaApi: 'https://em-npa-aat.service.core-compute-aat.internal/health',
        cohCorApi: 'https://coh-cor-aat.service.core-compute-aat.internal/health',
        rdProfessionalApi: 'https://rpa-rd-professional-aat.service.core-compute-aat.internal/health',
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
