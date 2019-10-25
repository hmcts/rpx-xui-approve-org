import {LoggerService} from './logger.service';

describe('Logger service', () => {
  const mockedMonitoringService = jasmine.createSpyObj('mockedMonitoringService', ['logEvent', 'logException']);
  const mockedNgxLogger = jasmine.createSpyObj('mockedNgxLogger', ['trace', 'debug', 'info',
    'log', 'warn', 'error', 'fatal']);
  const mockedCookieService = jasmine.createSpyObj('mockedCookieService', ['get']);
  const mockedCryptoWrapper = jasmine.createSpyObj('mockedCryptoWrapper', ['encrypt', 'decrypt']);
  const mockJwtDecodeWrapper = jasmine.createSpyObj('mockJwtDecodeWrapper', ['decode']);
  const mockEnvironmentService = jasmine.createSpyObj('mockEnvironmentService', ['getConfig']);
  mockEnvironmentService.cookies = {token: 'test'};

  it('should be Truthy', () => {
    const service = new LoggerService(mockedMonitoringService, mockedNgxLogger, mockedCookieService,
      mockedCryptoWrapper, mockJwtDecodeWrapper, mockEnvironmentService);
    expect(service).toBeTruthy();
  });

  it('should be able to call info', () => {
    const service = new LoggerService(mockedMonitoringService, mockedNgxLogger, mockedCookieService,
      mockedCryptoWrapper, mockJwtDecodeWrapper, mockEnvironmentService);
    service.info('message');
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
    expect(mockedNgxLogger.info).toHaveBeenCalled();
  });

  it('should be able to call warn', () => {
    try {
      const service = new LoggerService(mockedMonitoringService, mockedNgxLogger, mockedCookieService,
        mockedCryptoWrapper, mockJwtDecodeWrapper, mockEnvironmentService);
      service.warn('message');
    } catch (e) {
      console.log(e)
    }
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
    expect(mockedNgxLogger.warn).toHaveBeenCalled();
  });

  it('should be able to call error', () => {
    try {
      const service = new LoggerService(mockedMonitoringService, mockedNgxLogger, mockedCookieService,
        mockedCryptoWrapper, mockJwtDecodeWrapper, mockEnvironmentService);
      service.error('message');
    } catch (e) {
    }
    expect(mockedMonitoringService.logException).toHaveBeenCalled();
    expect(mockedNgxLogger.error).toHaveBeenCalled();
  });

  it('should be able to call fatal', () => {
    try {
      const service = new LoggerService(mockedMonitoringService, mockedNgxLogger, mockedCookieService,
        mockedCryptoWrapper, mockJwtDecodeWrapper, mockEnvironmentService);
      service.fatal('message');
    } catch (e) {
    }
    expect(mockedMonitoringService.logException).toHaveBeenCalled();
    expect(mockedNgxLogger.fatal).toHaveBeenCalled();
  });

  it('should be able to call debug', () => {
    try {
      const service = new LoggerService(mockedMonitoringService, mockedNgxLogger, mockedCookieService,
        mockedCryptoWrapper, mockJwtDecodeWrapper, mockEnvironmentService);
      service.debug('message');
    } catch (e) {
    }
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
  });

  it('should be able to call trace', () => {
    try {
      const service = new LoggerService(mockedMonitoringService, mockedNgxLogger, mockedCookieService,
        mockedCryptoWrapper, mockJwtDecodeWrapper, mockEnvironmentService);
      service.trace('message');
    } catch (e) {
    }
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
    expect(mockedNgxLogger.trace).toHaveBeenCalled();
  });
});
