// TODO remove this file and use the one in the environment dir
export default {
    services: {
        idam_web: 'https://idam.preprod.ccidam.reform.hmcts.net',
        idam_api: 'https://preprod-idamapi.reform.hmcts.net:3511',
        s2s: 'http://rpe-service-auth-provider-aat.service.core-compute-aat.internal'
    },
    proxy: {
        host: '172.16.0.7',
        port: 8080,
    },
    protocol: 'http',
    secureCookie: false,
    sessionSecret: 'secretSauce',
};
