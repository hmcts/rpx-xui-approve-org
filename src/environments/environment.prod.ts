export const environment = {
  production: true,
  googleAnalyticsKey: 'UA-124734893-1',
  serviceDeskEmail: 'DCD-ITServiceDesk@hmcts.net',
  serviceDeskTel: '0300 3030686',
  singleOrgUrl: 'http://localhost:1400/organisations?pbaNumber=',
  orgActiveUrl: 'api/organisations',
  orgPendingUrl: 'http://localhost:1400/organisations?status=PENDING',
  orgApprovePendingUrl: 'http://localhost:1400/putApprovedOrganisations',
  loggingLevel: 'DEBUG',
  cookies: {
    token: '__auth__',
    userId: '__userid__',
  },
  urls: {
    idam: {
      idamApiUrl: 'https://idam-api.aat.platform.hmcts.net',
      idamClientID: 'xuiwebapp',
      idamLoginUrl: 'https://idam-web-public.aat.platform.hmcts.net',
      indexUrl: '/',
      oauthCallbackUrl: 'oauth2/callback'
      }
  }
};
