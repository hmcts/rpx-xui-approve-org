export default {
    services: {
        ccdDataApi: 'https://ccd-data-store-api-demo.service.core-compute-demo.internal',
        ccdDefApi: 'https://ccd-definition-store-api-aat.service.core-compute-aat.internal',
        idamWeb: 'https://idam-web-public.ithc.platform.hmcts.net',
        idamApi: 'https://idam-api.ithc.platform.hmcts.net',
        s2s: 'http://rpe-service-auth-provider-ithc.service.core-compute-ithc.internal',
        draftStoreApi: 'https://draft-store-service-demo.service.core-compute-demo.internal',
        dmStoreApi: 'https://dm-store-demo.service.core-compute-demo.internal',
        emAnnoApi: 'https://em-anno-demo.service.core-compute-demo.internal',
        emNpaApi: 'https://em-npa-demo.service.core-compute-demo.internal',
        rdProfessionalApi: 'https://rpa-rd-professional-ithc.service.core-compute-ithc.internal',
    },
    useProxy: false,
    secureCookie: false,
    sessionSecret: 'secretSauce',
    logging: 'debug',
}
