import { of } from 'rxjs';
import { MonitorConfig, MonitoringService } from './monitoring.service';

describe('Monitoring service', () => {
  const mockedHttpClient = jasmine.createSpyObj('mockedHttpClient', { get: of({ connectionString: 'InstrumentationKey=dummy' }) });
  const mockedConfig = new MonitorConfig();

  it('should be Truthy', () => {
    const service = new MonitoringService(mockedHttpClient);
    expect(service).toBeTruthy();
  });

  it('should be able to LogException and Should call the http service', async () => {
    const service = new MonitoringService(mockedHttpClient);
    expect(service).toBeTruthy();
    service.logException(new Error('Some ErrorMesssage'));
    expect(mockedHttpClient.get).toHaveBeenCalled();
  });

  it('should be able to LogEvent', async () => {
    const service = new MonitoringService(mockedHttpClient);
    expect(service).toBeTruthy();
    service.logEvent('name', [], []);
    expect(mockedHttpClient.get).toHaveBeenCalled();
  });

  it('should be able to LogPageview', async () => {
    const service = new MonitoringService(mockedHttpClient);
    expect(service).toBeTruthy();
    service.logPageView('name', null, [], [], 1);
    expect(mockedHttpClient.get).toHaveBeenCalled();
  });
});
