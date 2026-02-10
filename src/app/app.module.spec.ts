import { EnvironmentConfig } from 'src/models/environmentConfig.model';
import { launchDarklyClientIdFactory } from './app.module';

const environmentConfig: EnvironmentConfig = {
  launchDarklyClientId: null,
  cookies: undefined,
  idamClient: '',
  indexUrl: '',
  now: false,
  microservice: '',
  oauthCallbackUrl: '',
  protocol: '',
  services: undefined,
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
