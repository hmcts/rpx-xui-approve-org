export default {
    appInsightsInstrumentationKey :  process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "AAAAAAAAAAAAAAAA",
    logging: 'debug',
    maxLogLine: 80,
    proxy: {
      host: '172.16.0.7',
      port: 8080,
    },
    secureCookie: false,
    services: {
      rd_professional_api: 'https://rpa-rd-professional-aat.service.core-compute-aat.internal',
    },
    sessionSecret: 'secretSauce',
}
