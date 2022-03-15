import { TestBed, inject } from '@angular/core/testing';

import { EnvironmentService } from './environment.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EnvironmentConfig } from 'src/models/environmentConfig.model';

describe('EnvironmentService', () => {

  let httpTestingController: HttpTestingController;
  let service: EnvironmentService;
  const testData: EnvironmentConfig = {
    appInsightsInstrumentationKey: 'key',
    configEnv: 'test',
    cookies: {
      roles: 'roleA,roleB',
      token: 'token',
      userId: 'userId'
    },
    exceptionOptions: {
      maxLines: 10
    },
    health: {
      ccdDataApi: 'ccdDataApi',
      ccdDefApi: 'ccdDefApi',
      idamApi: 'idamApi',
      idamWeb: 'idamWeb',
      iss: 'iss',
      rdProfessionalApi: 'rdProfessionalApi',
      s2s: 's2s'
    },
    idamClient: 'idamClient',
    indexUrl: 'indexUrl',
    logging: 'logging',
    maxLogLine: 10,
    microservice: 'microservice',
    now: true,
    oauthCallbackUrl: 'oauthCallbackUrl',
    oidcEnabled: true,
    protocol: 'http',
    proxy: {
      host: 'host',
      port: 1
    },
    secureCookie: false,
    services: {
      ccdDataApi: 'ccdDataApi',
      ccdDefApi: 'ccdDefApi',
      idamApi: 'idamApi',
      idamWeb: 'idamWeb',
      iss: 'iss',
      rdProfessionalApi: 'rdProfessionalApi',
      s2s: 's2s'
    },
    sessionSecret: 'sessionSecret',
    launchDarklyClientId: 'ldClientId'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironmentService],
      imports: [HttpClientTestingModule]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(EnvironmentService);
  });

  it('should be created', inject([EnvironmentService], (service: EnvironmentService) => {
    expect(service).toBeTruthy();
  }));

  it('should load environment from correct URL', () => {
    const req = httpTestingController.expectOne('/api/environment/config');
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpTestingController.verify();
  });

  it('gets the correct data', () => {
    const req = httpTestingController.expectOne('/api/environment/config');
    req.flush(testData);
    expect(service.get('configEnv')).toEqual('test');
    httpTestingController.verify();
  });

  it('returns the full observable', () => {
    const req = httpTestingController.expectOne('/api/environment/config');
    const obs = service.getEnv$();
    req.flush(testData);
    obs.subscribe(data => expect(data.configEnv).toEqual('test'));
    httpTestingController.verify();
  });
});
