import { getConfigValue, getEnvironment, showFeature } from '.';
import { UIConfig, UIConfigCookies, UIConfigServices } from '../interfaces/ui.config';
import {
  COOKIE_TOKEN,
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
      token: getConfigValue(COOKIE_TOKEN)
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
