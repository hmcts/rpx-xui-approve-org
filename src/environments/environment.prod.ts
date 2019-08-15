export const environment = {
  production: true,
  googleAnalyticsKey: 'UA-124734893-1',
  serviceDeskEmail: 'DCD-ITServiceDesk@hmcts.net',
  serviceDeskTel: '0300 3030686',
  singleOrgUrl: 'api/organisations?organisationId=',
  orgActiveUrl: 'api/organisations',
  orgPendingUrl: 'api/organisations?status=PENDING',
  orgApprovePendingUrl: 'api/organisations/',
  loggingLevel: 'DEBUG',
  cookies: {
    token: '__auth__',
    userId: '__userid__',
  },
  urls: {
    idam: {
      idamApiUrl: 'https://idam-api.ithc.platform.hmcts.net',
      idamClientID: 'xuiaowebapp',
      idamLoginUrl: 'https://idam-web-public.ithc.platform.hmcts.net',
      indexUrl: '/',
      oauthCallbackUrl: 'oauth2/callback'
      }
  }
};
