import { inject, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { EnvironmentConfig } from 'src/models/environmentConfig.model';
import { EnvironmentService } from './environment.service';

const environmentConfig: EnvironmentConfig = {
  appInsightsInstrumentationKey: '123',
  configEnv: '',
  cookies: undefined,
  exceptionOptions: undefined,
  health: undefined,
  idamClient: '',
  indexUrl: '',
  logging: '',
  now: false,
  maxLogLine: 0,
  microservice: '',
  oauthCallbackUrl: '',
  protocol: '',
  proxy: undefined,
  secureCookie: false,
  services: undefined,
  sessionSecret: '',
  oidcEnabled: false
};

describe('EnvironmentService', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockedHttpClient;

  beforeEach(() => {
    mockedHttpClient = jasmine.createSpyObj('mockedHttpClient', { get: of(environmentConfig) });

    TestBed.configureTestingModule({
      providers: [EnvironmentService],
      imports: [HttpClientTestingModule]
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
