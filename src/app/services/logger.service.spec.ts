import { LoggerService } from './logger.service';

describe('Logger service', () => {
  const mockedMonitoringService = jasmine.createSpyObj('mockedMonitoringService', ['logEvent', 'logException']);
  const mockedNgxLogger = jasmine.createSpyObj('mockedNgxLogger', ['trace', 'debug', 'info',
    'log', 'warn', 'error', 'fatal']);
  const mockedCookieService = jasmine.createSpyObj('mockedCookieService', ['get']);
  const mockJwtDecodeWrapper = jasmine.createSpyObj('mockJwtDecodeWrapper', ['decode']);
  const mockEnvironmentService = jasmine.createSpyObj('mockEnvironmentService', { get: { cookies: { token: 'test' } } });
  const mockedSessionStorageService = jasmine.createSpyObj('mockedSessionStorageService', ['setItem', 'getItem']);

  let service: LoggerService;

  beforeEach(() => {
    mockedSessionStorageService.getItem.calls.reset();
    mockedSessionStorageService.getItem.and.returnValue(undefined);
    service = new LoggerService(mockedMonitoringService, mockedNgxLogger, mockedCookieService,
      mockJwtDecodeWrapper, mockEnvironmentService, mockedSessionStorageService);
  });

  it('should be Truthy', () => {
    expect(service).toBeTruthy();
  });

  it('should include the user ID from session storage in the formatted message', () => {
    spyOn(Date, 'now').and.returnValue(123456789);
    mockedSessionStorageService.getItem.withArgs('userDetails').and.returnValue(JSON.stringify({
      uid: '5b9639a7-49a5-4c85-9e17-bf55186c8afa'
    }));

    expect(service.getMessage('message')).toBe(
      'User - 5b9639a7-49a5-4c85-9e17-bf55186c8afa, Message - message, Timestamp - 123456789'
    );
    expect(mockedSessionStorageService.getItem).toHaveBeenCalledOnceWith('userDetails');
  });

  it('should be able to call info', () => {
    service.info('message');
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
    expect(mockedNgxLogger.info).toHaveBeenCalled();
  });

  it('should be able to call warn', () => {
    service.warn('message');
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
    expect(mockedNgxLogger.warn).toHaveBeenCalled();
  });

  it('should be able to call error', () => {
    service.error('message');
    expect(mockedMonitoringService.logException).toHaveBeenCalled();
    expect(mockedNgxLogger.error).toHaveBeenCalled();
  });

  it('should be able to call fatal', () => {
    service.fatal('message');
    expect(mockedMonitoringService.logException).toHaveBeenCalled();
    expect(mockedNgxLogger.fatal).toHaveBeenCalled();
  });

  it('should be able to call debug', () => {
    service.debug('message');
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
  });

  it('should be able to call trace', () => {
    service.trace('message');
    expect(mockedMonitoringService.logEvent).toHaveBeenCalled();
    expect(mockedNgxLogger.trace).toHaveBeenCalled();
  });
});
