import { getConfigValue, getEnvironment, showFeature } from '.';
import { UIConfig, UIConfigCookies, UIConfigServices } from '../interfaces/ui.config';
import {
  COOKIE_ROLES,
  COOKIE_TOKEN,
  COOKIES_USERID,
  FEATURE_OIDC_ENABLED,
  IDAM_CLIENT,
  LAUNCH_DARKLY_CLIENT_ID,
  OAUTH_CALLBACK_URL,
  PROTOCOL,
  SERVICES_IDAM_WEB
} from './references';

export const uiConfig = (): UIConfig => {
  return {
    configEnv: getEnvironment(),
    cookies: {
      roles: getConfigValue(COOKIE_ROLES),
      token: getConfigValue(COOKIE_TOKEN),
      userId: getConfigValue(COOKIES_USERID)
    } as UIConfigCookies,
    idamClient: getConfigValue(IDAM_CLIENT),
    oauthCallbackUrl: getConfigValue(OAUTH_CALLBACK_URL),
    oidcEnabled: showFeature(FEATURE_OIDC_ENABLED),
    protocol: getConfigValue(PROTOCOL),
    services: {
      idamWeb: getConfigValue(SERVICES_IDAM_WEB)
    } as UIConfigServices,
    launchDarklyClientId: getConfigValue(LAUNCH_DARKLY_CLIENT_ID)
  };
};
