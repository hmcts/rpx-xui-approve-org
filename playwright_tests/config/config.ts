require('../../playwright-env');

const firstNonEmpty = (...values: Array<string | undefined>) => values.find((value) => value?.trim())?.trim();

export const config = {
  baseUrl: firstNonEmpty(
    process.env.TEST_URL,
    process.env.EXUI_BASE_URL,
    'https://administer-orgs.aat.platform.hmcts.net/'
  ) as string,
  registerUrl: firstNonEmpty(
    process.env.TEST_REGISTER_URL,
    process.env.MANAGE_ORG_API_PATH,
    'https://manage-org.aat.platform.hmcts.net'
  ) as string,
  base: {
    username: firstNonEmpty(
      process.env.AO_ADMIN_USERNAME,
      process.env.EXUI_APPROVE_ORG_USERNAME,
      'vamshiadminuser@mailnesia.com'
    ) as string,
    password: firstNonEmpty(
      process.env.AO_ADMIN_PASSWORD,
      process.env.EXUI_APPROVE_ORG_PASSWORD,
      'Testing123'
    ) as string
  },
  twoFactorAuthEnabled: false,
  termsAndConditionsEnabled: true
};
