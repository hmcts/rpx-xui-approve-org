import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EnvironmentService } from 'src/app/services/environment.service';
import { EnvironmentConfig } from 'src/models/environmentConfig.model';
import { AuthService } from './auth.service';

const environmentConfig: EnvironmentConfig = {
  appInsightsInstrumentationKey: '',
  configEnv: '',
  cookies: undefined,
  exceptionOptions: undefined,
  health: undefined,
  idamClient: 'example',
  indexUrl: '',
  logging: '',
  now: false,
  maxLogLine: 0,
  microservice: '',
  oauthCallbackUrl: '',
  protocol: 'https://',
  proxy: undefined,
  secureCookie: false,
  services: {
    idamWeb: 'idamweb',
    idamApi: undefined,
    ccdDataApi: undefined,
    ccdDefApi: undefined,
    rdProfessionalApi: undefined,
    s2s: undefined,
    iss: undefined
  },
  sessionSecret: '',
  oidcEnabled: false
}

const expectedGeneratedUrlFromConfig
  = 'idamweb/login?response_type=code&client_id=example&redirect_uri=https://://localhost:9876&scope=profile openid roles manage-user create-user manage-roles';

describe('AuthService', () => {
  let authService: AuthService;
  let envServiceSpy: EnvironmentService;
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);

  beforeEach(() => {
    envServiceSpy = jasmine.createSpyObj('EnvironmentService', ['get', 'getEnv$']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: EnvironmentService, useValue: envServiceSpy }
      ]
    });

    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('loginRedirect()', () => {
    it('should redirect to auth/login when oidc enabled', () => {
      envServiceSpy.get = jasmine.createSpy('get').and.returnValue(true);
      authService.redirect = jasmine.createSpy('redirect').and.returnValue(null);
      authService.loginRedirect();
      expect(authService.redirect).toHaveBeenCalledTimes(1);
      expect(authService.redirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should redirect to a generatd URL when oidc disabled', () => {
      envServiceSpy.getEnv$ = jasmine.createSpy('getEnv$').and.returnValue(of(environmentConfig));
      envServiceSpy.get = jasmine.createSpy('get').and.returnValue(false);

      authService.redirect = jasmine.createSpy('redirect').and.returnValue(null);
      authService.loginRedirect();
      expect(authService.redirect).toHaveBeenCalledTimes(1);
      expect(authService.redirect).toHaveBeenCalledWith(expectedGeneratedUrlFromConfig);
    });
  });

  describe('isAuthenticated()', () => {
    it('should return true when user is authenticated', () => {
      httpClientSpy.get.and.returnValue(of(true));

      authService.isAuthenticated().subscribe(authenticated => {
        expect(authenticated).toBeTrue();
      });
    });

    it('should return false when user is unauthenticated', () => {
      httpClientSpy.get.and.returnValue(of(false));

      authService.isAuthenticated().subscribe(authenticated => {
        expect(authenticated).toBeFalse();
      });
    });
  });

  describe('generateLoginUrl()', () => {
    it('should return a URL generated from the stored config', () => {
      envServiceSpy.getEnv$ = jasmine.createSpy('getEnv$').and.returnValue(of(environmentConfig));

      authService.generateLoginUrl().subscribe(generatedUrl => {
        expect(generatedUrl).toBe(expectedGeneratedUrlFromConfig);
      });
    });
  });

  describe('decodeJwt()', () => {
    it('should decode the provided JWT', () => {
      const result = authService.decodeJwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      expect(result).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
    });
  })
});
