export const config = {
  baseUrl: process.env.TEST_URL || 'https://administer-orgs.aat.platform.hmcts.net/',
  base: {
    username: 'vamshiadminuser@mailnesia.com',
    password: 'Testing123'
  },
  twoFactorAuthEnabled: false,
  termsAndConditionsEnabled: true
};
