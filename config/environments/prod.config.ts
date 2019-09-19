export default {
    services: {
        idam_web: 'https://idam-web-public-idam-prod.service.core-compute-prod.internal',
        idam_api: 'https://idam-api-idam-prod.service.core-compute-prod.internal',
        s2s: 'http://rpe-service-auth-provider-prod.service.core-compute-prod.internal'
    },
    useProxy: false,
    secureCookie: true,
    sessionSecret: 'secretSauce'
};
