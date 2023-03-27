import { of } from 'rxjs';
import { MonitorConfig, MonitoringService } from './monitoring.service';

describe('Monitoring service', () => {
  let mockedHttpClient: any;
  let mockedAppInsights: any;
  const mockedConfig = new MonitorConfig();

  beforeEach(() => {
    mockedHttpClient = jasmine.createSpyObj('mockedHttpClient', {get: of({key: 'Some Value'})});
    mockedAppInsights = jasmine.createSpyObj('mockedAppInsights', ['downloadAndSetup', 'trackException', 'trackEvent', 'trackPageView']);
  });

  it('should be Truthy', () => {
    const service = new MonitoringService(mockedHttpClient);
    expect(service).toBeTruthy();
  });

  it('should be able to LogException and Should not call the http service', async () => {
    mockedConfig.instrumentationKey = 'somevalue';
    const service = new MonitoringService(mockedHttpClient, mockedConfig, mockedAppInsights);
    expect(service).toBeTruthy();
    service.logException(new Error('Some ErrorMesssage'));
    expect(mockedHttpClient.get).not.toHaveBeenCalled();
    expect(mockedAppInsights.downloadAndSetup).not.toHaveBeenCalled();
    expect(mockedAppInsights.trackException).toHaveBeenCalled();
  });

  it('should be able to LogEvent', async () => {
    mockedConfig.instrumentationKey = 'somevalue';
    const service = new MonitoringService(mockedHttpClient, mockedConfig, mockedAppInsights);
    expect(service).toBeTruthy();
    service.logEvent('name', [], []);
    expect(mockedHttpClient.get).not.toHaveBeenCalled();
    expect(mockedAppInsights.downloadAndSetup).not.toHaveBeenCalled();
    expect(mockedAppInsights.trackEvent).toHaveBeenCalled();
  });

  it('should be able to LogPageview', async () => {
    mockedConfig.instrumentationKey = 'somevalue';
    const service = new MonitoringService(mockedHttpClient, mockedConfig, mockedAppInsights);
    expect(service).toBeTruthy();
    service.logPageView('name', null, [], [], 1);
    expect(mockedHttpClient.get).not.toHaveBeenCalled();
    expect(mockedAppInsights.downloadAndSetup).not.toHaveBeenCalled();
    expect(mockedAppInsights.trackPageView).toHaveBeenCalled();
  });

  it('should be able to LogPageview', async () => {
    mockedConfig.instrumentationKey = null;
    const service = new MonitoringService(mockedHttpClient, mockedConfig, mockedAppInsights);
    expect(service).toBeTruthy();
    service.logPageView('name', null, [], [], 1);
    expect(mockedHttpClient.get).toHaveBeenCalled();
  });
});
