import { Request } from 'express';
import { getConfigValue } from './configuration';
import { SERVICES_IDAM_API_PATH } from './configuration/references';
import { http } from './lib/http';
import * as log4jui from './lib/log4jui';

export const IDAM_CHECK_BASE_DELAY_MS = 30000;
export const IDAM_CHECK_MAX_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const wait = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

export const idamCheck = async (resolve, reject) => {
  const idamApiUrl = getConfigValue(SERVICES_IDAM_API_PATH);
  const axiosInstance = http({} as unknown as Request);
  const logger = log4jui.getLogger('idam-check');

  const targetUrl = `${idamApiUrl}/o/.well-known/openid-configuration`;
  const deadline = Date.now() + IDAM_CHECK_MAX_DURATION_MS;
  let lastError: unknown;

  for (let attempt = 1; Date.now() < deadline; attempt++) {
    try {
      await axiosInstance.get(targetUrl);
      resolve();
      return;
    } catch (err) {
      lastError = err;
      const remainingWindow = deadline - Date.now();

      if (remainingWindow <= 0) {
        break;
      }

      const nextDelay = Math.min(IDAM_CHECK_BASE_DELAY_MS, remainingWindow);
      logger.warn(`idam api check failed (attempt ${attempt}, retrying in ${nextDelay}ms)`, err);
      await wait(nextDelay);
    }
  }

  logger.error('idam api check failed after retries', lastError);
  reject(lastError);
  process.exit(1);
};
