export default {
    services: {
        ccd_data_api:
            'https://ccd-data-store-api-sprod.service.core-compute-sprod.internal',
        ccd_def_api:
            'https://ccd-definition-store-api-sprod.service.core-compute-sprod.internal',
        idam_web: 'https://idam-test.dev.ccidam.reform.hmcts.net',
        idam_api: 'https://betaDevBccidamAppLB.reform.hmcts.net',
        s2s:
            'https://rpe-service-auth-provider-sprod.service.core-compute-sprod.internal',
        draft_store_api:
            'https://draft-store-service-sprod.service.core-compute-sprod.internal',
        dm_store_api:
            'https://dm-store-sprod.service.core-compute-sprod.internal',
        em_anno_api:
            'https://em-anno-sprod.service.core-compute-sprod.internal',
        em_npa_api: 'https://em-npa-sprod.service.core-compute-sprod.internal',
        coh_cor_api: 'https://coh-cor-sprod.service.core-compute-sprod.internal'
    },
    useProxy: false,
    secureCookie: false,
    sessionSecret: 'secretSauce'
};
