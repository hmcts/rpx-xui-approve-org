import { EnvironmentConfig } from 'src/models/environmentConfig.model';
import { launchDarklyClientIdFactory } from './app.module';

const environmentConfig: EnvironmentConfig = {
  launchDarklyClientId: undefined,
  configEnv: '',
  cookies: {
    token: '__auth__'
  },
  idamClient: '',
  oauthCallbackUrl: '',
  protocol: '',
  services: {
    idamWeb: ''
  },
  oidcEnabled: false
};

describe('AppModule', () => {
  describe('launchDarklyClientIdFactory()', () => {
    it('should return empty if launchDarklyClientId is missing', () => {
      const env = { ...environmentConfig, launchDarklyClientId: undefined };

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
