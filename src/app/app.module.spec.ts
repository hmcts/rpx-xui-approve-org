import { EnvironmentConfig } from 'src/models/environmentConfig.model';
import { launchDarklyClientIdFactory } from './app.module';

const environmentConfig: EnvironmentConfig = {
  launchDarklyClientId: null,
  cookies: {
    token: '__auth__',
    userId: '__userid__',
    roles: 'roles'
  },
  idamClient: 'xuiaowebapp',
  indexUrl: '',
  now: false,
  microservice: 'xui_webapp',
  oauthCallbackUrl: '/oauth2/callback',
  protocol: 'https',
  services: {
    idamWeb: 'https://idam-web-public.aat.platform.hmcts.net'
  },
  oidcEnabled: false
};

describe('AppModule', () => {
  describe('launchDarklyClientIdFactory()', () => {
    it('should return empty if config is null', () => {
      const env = { ...environmentConfig, launchDarklyClientId: null };

      const result = launchDarklyClientIdFactory(env);

      expect(result).toEqual('');
    });

    it('should return launchDarklyClientId from env', () => {
      const env = { ...environmentConfig, launchDarklyClientId: '123' };

      const result = launchDarklyClientIdFactory(env);

      expect(result).toEqual('123');
    });
  });
});
