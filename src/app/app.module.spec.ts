import { EnvironmentConfig } from 'src/models/environmentConfig.model';
import { launchDarklyClientIdFactory, STORE_RUNTIME_CHECKS } from './app.module';

const environmentConfig: EnvironmentConfig = {
  launchDarklyClientId: undefined,
  configEnv: '',
  cookies: {
    roles: 'roles',
    token: '__auth__',
    userId: '__userid__'
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
  describe('STORE_RUNTIME_CHECKS', () => {
    it('should enable runtime immutability checks for AppModule store configuration', () => {
      expect(STORE_RUNTIME_CHECKS).toEqual({
        strictStateImmutability: true,
        strictActionImmutability: true
      });
    });
  });

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
