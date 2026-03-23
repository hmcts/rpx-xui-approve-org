const firstNonEmpty = (...values: Array<string | undefined>) => values.find((value) => value?.trim())?.trim();

const normalizeBaseUrl = (baseUrl: string) => new URL(baseUrl).toString();

const baseUrl =
  firstNonEmpty(process.env.TEST_URL, process.env.EXUI_BASE_URL) || 'https://administer-orgs.aat.platform.hmcts.net/';
const registerUrl =
  firstNonEmpty(process.env.TEST_REGISTER_URL, process.env.MANAGE_ORG_API_PATH) || 'https://manage-org.aat.platform.hmcts.net';
const username =
  firstNonEmpty(process.env.AO_ADMIN_USERNAME, process.env.EXUI_APPROVE_ORG_USERNAME) || 'vamshiadminuser@mailnesia.com';
const password = firstNonEmpty(process.env.AO_ADMIN_PASSWORD, process.env.EXUI_APPROVE_ORG_PASSWORD) || 'Testing123';

export const getAppConfig = () => ({
  baseUrl: normalizeBaseUrl(baseUrl),
  registerUrl: normalizeBaseUrl(registerUrl),
  username,
  password,
});

export const buildUrl = (appBaseUrl: string, path: string = '') => new URL(path, normalizeBaseUrl(appBaseUrl)).toString();

export const getAppBaseUrl = () => getAppConfig().baseUrl;

export const resolveAppUrl = (path: string = '') => buildUrl(getAppConfig().baseUrl, path);

export const resolveRegisterUrl = (path: string = '') => buildUrl(getAppConfig().registerUrl, path);
