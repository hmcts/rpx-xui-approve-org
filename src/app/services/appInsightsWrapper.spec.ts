import { AppInsights } from 'applicationinsights-js';
import { AppInsightsWrapper } from './appInsightsWrapper';

describe('AbstractAppInsights', () => {

  it('when startTrackPage is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'startTrackPage');
    a.startTrackPage();
    expect(AppInsights.startTrackPage).toHaveBeenCalled();
  });
  it('when stopTrackPage is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'stopTrackPage');
    a.stopTrackPage();
    expect(AppInsights.stopTrackPage).toHaveBeenCalled();
  });
  it('when trackPageView is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'trackPageView');
    a.trackPageView();
    expect(AppInsights.trackPageView).toHaveBeenCalled();
  });
  it('when startTrackEvent is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'startTrackEvent');
    a.startTrackEvent('name');
    expect(AppInsights.startTrackEvent).toHaveBeenCalled();
  });
  it('when stopTrackEvent is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'stopTrackEvent');
    a.stopTrackEvent('name');
    expect(AppInsights.stopTrackEvent).toHaveBeenCalled();
  });
  it('when trackEvent is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'trackEvent');
    a.trackEvent('name');
    expect(AppInsights.trackEvent).toHaveBeenCalled();
  });
  it('when trackDependency is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'trackDependency');
    a.trackDependency('id', 'method', 'url', 'path', 0, true, 1);
    expect(AppInsights.trackDependency).toHaveBeenCalled();
  });
  it('when trackException is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'trackException');
    a.trackException(new Error());
    expect(AppInsights.trackException).toHaveBeenCalled();
  });
  it('when trackMetric is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'trackMetric');
    a.trackMetric('name', 0);
    expect(AppInsights.trackMetric).toHaveBeenCalled();
  });
  it('when trackTrace is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'trackTrace');
    a.trackTrace('message');
    expect(AppInsights.trackTrace).toHaveBeenCalled();
  });
  it('when flush is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'flush');
    a.flush();
    expect(AppInsights.flush).toHaveBeenCalled();
  });
  it('when setAuthenticatedUserContext is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'setAuthenticatedUserContext');
    a.setAuthenticatedUserContext('id');
    expect(AppInsights.setAuthenticatedUserContext).toHaveBeenCalled();
  });
  it('when clearAuthenticatedUserContext is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'clearAuthenticatedUserContext');
    a.clearAuthenticatedUserContext();
    expect(AppInsights.clearAuthenticatedUserContext).toHaveBeenCalled();
  });
  it('when downloadAndSetup is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, 'downloadAndSetup');
    a.downloadAndSetup({});
    expect(AppInsights.downloadAndSetup).toHaveBeenCalled();
  });

  // When running tests, _onerror doesn't seem to exist on AppInsights, so we can't spy on it?
  xit('when _onerror is called it should pass through', () => {
    const { build } = setup().default();
    const a = build();
    spyOn(AppInsights, '_onerror');
    a._onerror('message', 'url', 1, 1, new Error());
    expect(AppInsights._onerror).toHaveBeenCalled();
  });
  
});

function setup() {
  
  const builder = {
    
    default() {
      return builder;
    },
    build() {
      return new AppInsightsWrapper();
    }
  };

  return builder;
}
