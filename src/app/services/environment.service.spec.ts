import { inject, TestBed } from '@angular/core/testing';

import { EnvironmentConfig, ENVIRONMENT_CONFIG } from 'src/models/environmentConfig.model';
import { EnvironmentService } from './environment.service';

const environmentConfig: EnvironmentConfig = {
  appInsightsConnectionString: '123',
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
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        EnvironmentService,
        { provide: ENVIRONMENT_CONFIG, useValue: environmentConfig }
      ]
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
