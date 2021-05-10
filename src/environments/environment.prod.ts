export const environment = {
  production: true,
  googleAnalyticsKey: 'UA-124734893-5',
  serviceDeskEmail: 'DCD-ITServiceDesk@hmcts.net',
  serviceDeskTel: '0300 3030686',
  singleOrgUrl: 'api/organisations?organisationId=',
  organisationUsersUrl: 'api/organisations?usersOrgId=',
  orgActiveUrl: 'api/organisations?status=ACTIVE',
  orgPendingUrl: 'api/organisations?status=PENDING',
  reinviteUserUrl: 'api/reinviteUser?organisationId=',
  updatePbaUrl: 'api/updatePba',
  pbaUrl: 'api/pba',
  pbaAccUrl: 'api/pbaAccounts',
  organisationsUrl: 'api/organisations/',
  loggingLevel: 'DEBUG',
  cookies: {
    token: '__auth__',
    userId: '__userid__',
    roles: 'roles'
  },
  urls: {
    idam: {
      idamApiUrl: 'https://idam-api.platform.hmcts.net',
      idamClientID: 'xuiaowebapp',
      idamLoginUrl: 'https://hmcts-access.service.gov.uk',
      idamWeb: 'https://hmcts-access.service.gov.uk',
      indexUrl: '/',
      oauthCallbackUrl: '/oauth2/callback'
      }
  }
};
