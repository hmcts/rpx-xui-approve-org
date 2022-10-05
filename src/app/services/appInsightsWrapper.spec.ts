import { AppInsights } from 'applicationinsights-js';
import { AppInsightsWrapper } from './appInsightsWrapper';

describe('AppInsightsWrapper service', () => {
    let service: AppInsightsWrapper;

    beforeEach(() => {
        service = new AppInsightsWrapper();

        spyOn(AppInsights, 'startTrackPage');
        spyOn(AppInsights, 'stopTrackPage');
        spyOn(AppInsights, 'trackPageView');
        spyOn(AppInsights, 'startTrackEvent');
        spyOn(AppInsights, 'stopTrackEvent');
        spyOn(AppInsights, 'trackEvent');
        spyOn(AppInsights, 'trackDependency');
        spyOn(AppInsights, 'trackException');
        spyOn(AppInsights, 'trackMetric');
        spyOn(AppInsights, 'trackTrace');
        spyOn(AppInsights, 'flush');
        spyOn(AppInsights, 'setAuthenticatedUserContext');
        spyOn(AppInsights, 'clearAuthenticatedUserContext');
        spyOn(AppInsights, 'downloadAndSetup');
    });

    it('should wrap call to AppInsights - startTrackPage()', () => {
        service.startTrackPage();

        expect(AppInsights.startTrackPage).toHaveBeenCalled();
    });

    it('should wrap call to AppInsights - stopTrackPage()', () => {
        service.stopTrackPage();

        expect(AppInsights.stopTrackPage).toHaveBeenCalled();
    });

    it('should wrap call to AppInsights - trackPageView()', () => {
        service.trackPageView();

        expect(AppInsights.trackPageView).toHaveBeenCalled();
    });

    it('should wrap call to AppInsights - startTrackEvent()', () => {
        service.startTrackEvent('name');

        expect(AppInsights.startTrackEvent).toHaveBeenCalledWith('name');
    });

    it('should wrap call to AppInsights - stopTrackEvent()', () => {
        service.stopTrackEvent('name');

        expect(AppInsights.stopTrackEvent).toHaveBeenCalledWith('name', undefined, undefined);
    });

    it('should wrap call to AppInsights - trackEvent()', () => {
        service.trackEvent('name');

        expect(AppInsights.trackEvent).toHaveBeenCalledWith('name', undefined, undefined);
    });

    it('should wrap call to AppInsights - trackDependency()', () => {
        service.trackDependency('id', 'method', 'url', 'path', 1, false, 101);

        expect(AppInsights.trackDependency).toHaveBeenCalledWith('id', 'method', 'url', 'path', 1, false, 101, undefined, undefined);
    });

    it('should wrap call to AppInsights - trackException()', () => {
        const error = new Error('test');

        service.trackException(error);

        expect(AppInsights.trackException).toHaveBeenCalledWith(error, undefined, undefined, undefined, undefined);
    });

    it('should wrap call to AppInsights - trackMetric()', () => {
        service.trackMetric('id', 1);

        expect(AppInsights.trackMetric).toHaveBeenCalledWith('id', 1, undefined, undefined, undefined, undefined);
    });

    it('should wrap call to AppInsights - trackTrace()', () => {
        service.trackTrace('message');

        expect(AppInsights.trackTrace).toHaveBeenCalledWith('message', undefined, undefined);
    });

    it('should wrap call to AppInsights - flush()', () => {
        service.flush();

        expect(AppInsights.flush).toHaveBeenCalled();
    });

    it('should wrap call to AppInsights - setAuthenticatedUserContext()', () => {
        service.setAuthenticatedUserContext('id');

        expect(AppInsights.setAuthenticatedUserContext).toHaveBeenCalledWith('id', undefined, undefined);
    });

    it('should wrap call to AppInsights - clearAuthenticatedUserContext()', () => {
        service.clearAuthenticatedUserContext();

        expect(AppInsights.clearAuthenticatedUserContext).toHaveBeenCalled();
    });

    it('should wrap call to AppInsights - downloadAndSetup()', () => {
        service.downloadAndSetup({});

        expect(AppInsights.downloadAndSetup).toHaveBeenCalled();
    });
});
