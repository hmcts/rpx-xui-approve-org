export default {
    services: {
      idam_web:
        'https://hmcts-access.service.gov.uk',
      idam_api:
        'https://idam-api.platform.hmcts.net',
        s2s: 'https://rpe-service-auth-provider-prod.service.core-compute-prod.internal',
    },
    useProxy: false,
    secureCookie: true,
    sessionSecret: 'secretSauce',
}
