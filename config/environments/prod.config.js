module.exports = {
    services: {
        ccd_data_api: 'https://ccd-data-store-api-prod.service.core-compute-prod.internal',
        ccd_def_api: 'https://ccd-definition-store-api-prod.service.core-compute-prod.internal',
        idam_web: 'https://hmcts-access.service.gov.uk',
        //idam_api: 'https://idam-api.platform.hmcts.net',
        s2s: 'https://rpe-service-auth-provider-prod.service.core-compute-prod.internal',
        draft_store_api: 'https://draft-store-service-prod.service.core-compute-prod.internal',
        dm_store_api: 'https://dm-store-prod.service.core-compute-prod.internal',
        em_anno_api: 'https://em-anno-prod.service.core-compute-prod.internal',
        em_npa_api: 'https://em-npa-prod.service.core-compute-prod.internal',
        coh_cor_api: 'https://coh-cor-prod.service.core-compute-prod.internal'
    },
    useProxy: false,
    secureCookie: false,
    sessionSecret: 'secretSauce'
};
