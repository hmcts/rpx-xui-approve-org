export default {
    services: {
        ccd_data_api: 'http://localhost:4452',
        ccd_def_api: 'http://localhost:4452',
        idam_web: 'https://localhost:3501',
        idam_api: 'http://localhost:4501',
        s2s: 'http://localhost:4502',
        draft_store_api: 'http://localhost:8080',
        dm_store_api: 'http://localhost:4603',
        em_anno_api: 'http://localhost:3621',
        em_npa_api: 'http://localhost:3622',
        coh_cor_api: 'http://localhost:4701'
    },
    useProxy: false,
    protocol: 'http',
    secureCookie: false,
    sessionSecret: 'secretSauce'
};
