// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    // remove this line if GA is need only for production. For time being, to test on aat env, added this.
    googleAnalyticsKey: 'UA-124734893-6',
    serviceDeskEmail: 'DCD-ITServiceDesk@hmcts.net',
    serviceDeskTel: '0300 3030686',
    singleOrgUrl: 'api/organisations?organisationId=',
    orgActiveUrl: 'api/organisations?status=ACTIVE',
    updatePbaUrl: 'api/update-pba',
    orgPendingUrl: 'api/organisations?status=PENDING',
    orgApprovePendingUrl: 'api/organisations/',
    loggingLevel: 'DEBUG',
    cookies: {
      token: '__auth__',
      userId: '__userid__',
    },
    urls: {
      idam: {
        idamApiUrl: 'https://idam-api.perftest.platform.hmcts.net',
        idamClientID: 'xuiaowebapp',
        idamLoginUrl: 'https://idam-web-public.perftest.platform.hmcts.net',
        indexUrl: '/',
        oauthCallbackUrl: 'oauth2/callback'
      }
  }
};
