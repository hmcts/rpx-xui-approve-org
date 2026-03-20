import { config } from '../config/config';

const normalizeBaseUrl = (baseUrl: string) => new URL(baseUrl).toString();

export const buildUrl = (baseUrl: string, path: string = '') => new URL(path, normalizeBaseUrl(baseUrl)).toString();

export const getAppBaseUrl = () => normalizeBaseUrl(config.baseUrl);

export const resolveAppUrl = (path: string = '') => buildUrl(config.baseUrl, path);

export const resolveRegisterUrl = (path: string = '') => buildUrl(config.registerUrl, path);
