export const config = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000/',
  base: {
    username: 'vamshiadminuser@mailnesia.com',
    password: 'Testing123'
  },
  twoFactorAuthEnabled: false,
  termsAndConditionsEnabled: true
};
