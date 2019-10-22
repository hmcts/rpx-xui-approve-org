import { AppInsights } from 'applicationinsights-js';

export interface Properties { [name: string]: string; }
export interface Measurements { [name: string]: number; }

export abstract class AbstractAppInsights implements Microsoft.ApplicationInsights.IAppInsights {
  public config: Microsoft.ApplicationInsights.IConfig;
  public context: Microsoft.ApplicationInsights.ITelemetryContext;
  public queue: (() => void)[];

  public abstract startTrackPage(name?: string): void;

  public abstract stopTrackPage(
    name?: string,
    url?: string,
    properties?: Properties,
    measurements?: Measurements
  ): void;

  public abstract trackPageView(
    name?: string,
    url?: string,
    properties?: Properties,
    measurements?: Measurements,
    duration?: number
  ): void;

  public abstract startTrackEvent(name: string): void;

  public abstract stopTrackEvent(
    name: string,
    properties?: Properties,
    measurements?: Measurements
  ): void;

  public abstract trackEvent(
    name: string,
    properties?: Properties,
    measurements?: Measurements
  ): void;

  public abstract trackDependency(
    id: string,
    method: string,
    absoluteUrl: string,
    pathName: string,
    totalTime: number,
    success: boolean,
    resultCode: number,
    properties?: Properties,
    measurements?: Measurements
  ): void;


  public abstract trackException(
    exception: Error,
    handledAt?: string,
    properties?: Properties,
    measurements?: Measurements,
    severityLevel?: AI.SeverityLevel
  ): void;

  public abstract trackMetric(
    name: string,
    average: number,
    sampleCount?: number,
    min?: number,
    max?: number,
    properties?: Properties
  ): void;

  public abstract trackTrace(
    message: string,
    properties?: Properties,
    severityLevel?: AI.SeverityLevel
  ): void;

  public abstract flush(): void;

  public abstract setAuthenticatedUserContext(
    authenticatedUserId: string,
    accountId?: string,
    storeInCookie?: boolean
  ): void;

  public abstract clearAuthenticatedUserContext(): void;

  public abstract downloadAndSetup?(config: Microsoft.ApplicationInsights.IConfig): void;

  public abstract _onerror(
    message: string,
    url: string,
    lineNumber: number,
    columnNumber: number,
    error: Error
  ): void;

}

export class AppInsightsWrapper implements AbstractAppInsights {
  config: Microsoft.ApplicationInsights.IConfig;
  context: Microsoft.ApplicationInsights.ITelemetryContext;
  queue: (() => void)[];

  public startTrackPage(name?: string): void {
    AppInsights.startTrackPage(name);
  }

  public stopTrackPage(
    name?: string,
    url?: string,
    properties?: Properties,
    measurements?: Measurements
  ): void {
    AppInsights.stopTrackPage(name, url, properties, measurements);
  }

  public trackPageView(
    name?: string,
    url?: string,
    properties?: Properties,
    measurements?: Measurements,
    duration?: number
  ): void {
    AppInsights.trackPageView(name, url, properties, measurements, duration);
  }

  public startTrackEvent(name: string): void {
    AppInsights.startTrackEvent(name);
  }

  public stopTrackEvent(
    name: string,
    properties?: Properties,
    measurements?: Measurements
  ): void {
    AppInsights.stopTrackEvent(name, properties, measurements);
  }

  public trackEvent(
    name: string,
    properties?: Properties,
    measurements?: Measurements
  ): void {
    AppInsights.trackEvent(name, properties, measurements);
  }

  public trackDependency(
    id: string,
    method: string,
    absoluteUrl: string,
    pathName: string,
    totalTime: number,
    success: boolean,
    resultCode: number,
    properties?: Properties,
    measurements?: Measurements
  ): void {
    AppInsights.trackDependency(id, method, absoluteUrl, pathName, totalTime, success, resultCode, properties, measurements);
  }

  public trackException(
    exception: Error,
    handledAt?: string,
    properties?: Properties,
    measurements?: Measurements,
    severityLevel?: AI.SeverityLevel
  ): void {
    AppInsights.trackException(exception, handledAt, properties, measurements, severityLevel);
  }

  public trackMetric(
    name: string,
    average: number,
    sampleCount?: number,
    min?: number,
    max?: number,
    properties?: Properties
  ): void {
    AppInsights.trackMetric(name, average, sampleCount, min, max, properties);
  }

  public trackTrace(
    message: string,
    properties?: Properties,
    severityLevel?: AI.SeverityLevel
  ): void {
    AppInsights.trackTrace(message, properties, severityLevel);
  }

  public flush(): void {
    AppInsights.flush();
  }

  public setAuthenticatedUserContext(
    authenticatedUserId: string,
    accountId?: string,
    storeInCookie?: boolean
  ): void {
    AppInsights.setAuthenticatedUserContext(authenticatedUserId, accountId, storeInCookie);
  }

  public clearAuthenticatedUserContext(): void {
    AppInsights.clearAuthenticatedUserContext();
  }

  public downloadAndSetup(config: Microsoft.ApplicationInsights.IConfig): void {
    AppInsights.downloadAndSetup(config);
  }

  public _onerror(
    message: string,
    url: string,
    lineNumber: number,
    columnNumber: number,
    error: Error
  ): void {
    AppInsights._onerror(message, url, lineNumber, columnNumber, error);
  }
}
