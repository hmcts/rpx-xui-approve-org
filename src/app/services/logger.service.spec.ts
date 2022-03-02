import {LoggerService} from './logger.service';

describe('Logger service', () => {
  const mockedMonitoringService = jasmine.createSpyObj('mockedMonitoringService', ['logEvent', 'logException']);
  const mockedCookieService = jasmine.createSpyObj('mockedCookieService', ['get']);
  const mockedCryptoWrapper = jasmine.createSpyObj('mockedCryptoWrapper', ['encrypt', 'decrypt']);
  const mockJwtDecodeWrapper = jasmine.createSpyObj('mockJwtDecodeWrapper', ['decode']);
  const mockEnvironmentService = jasmine.createSpyObj('mockEnvironmentService', {get: { cookies: { token: 'test' } }});

  let service: LoggerService;

  beforeEach( () => {
    service = new LoggerService(mockedMonitoringService, mockedCookieService,
      mockedCryptoWrapper, mockJwtDecodeWrapper, mockEnvironmentService);
  });

  it('should be Truthy', () => {
    expect(service).toBeTruthy();
  });

  it('should be able to call info', () => {
    service.info('message');
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
  });

  it('should be able to call warn', () => {
    service.warn('message');
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
  });

  it('should be able to call error', () => {
    service.error('message');
    expect(mockedMonitoringService.logException).toHaveBeenCalled();
  });

  it('should be able to call fatal', () => {
    service.fatal('message');
    expect(mockedMonitoringService.logException).toHaveBeenCalled();
  });

  it('should be able to call debug', () => {
    service.debug('message');
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
  });

  it('should be able to call trace', () => {
    service.trace('message');
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
  });
});
