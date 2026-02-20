import { inject, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { EnvironmentConfig } from 'src/models/environmentConfig.model';
import { EnvironmentService } from './environment.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const environmentConfig: EnvironmentConfig = {
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

describe('EnvironmentService', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockedHttpClient;

  beforeEach(() => {
    mockedHttpClient = jasmine.createSpyObj('mockedHttpClient', { get: of(environmentConfig) });

    TestBed.configureTestingModule({
      imports: [],
      providers: [EnvironmentService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
  });

  it('should be created', inject([EnvironmentService], (service: EnvironmentService) => {
    expect(service).toBeTruthy();
  }));

  describe('getEnv$()', () => {
    it('should return the config data', inject([EnvironmentService], (service: EnvironmentService) => {
      service.getEnv$().subscribe((res) => expect(res).toBeDefined());
    }));
  });
});
