import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { AppInsights } from 'applicationinsights-js';
import { AbstractAppInsights } from './appInsightsWrapper';

export interface IMonitoringService {
  logPageView(name?: string, url?: string, properties?: any,
              measurements?: any, duration?: number): void;
  logEvent(name: string, properties?: any, measurements?: any): void;
  logException(exception: Error): void;
}

export class MonitorConfig implements Microsoft.ApplicationInsights.IConfig {
  public instrumentationKey?: string;
  public endpointUrl?: string;
  public emitLineDelimitedJson?: boolean;
  public accountId?: string;
  public sessionRenewalMs?: number;
  public sessionExpirationMs?: number;
  public maxBatchSizeInBytes?: number;
  public maxBatchInterval?: number;
  public enableDebug?: boolean;
  public disableExceptionTracking?: boolean;
  public disableTelemetry?: boolean;
  public verboseLogging?: boolean;
  public diagnosticLogInterval?: number;
  public samplingPercentage?: number;
  public autoTrackPageVisitTime?: boolean;
  public disableAjaxTracking?: boolean;
  public overridePageViewDuration?: boolean;
  public maxAjaxCallsPerView?: number;
  public disableDataLossAnalysis?: boolean;
  public disableCorrelationHeaders?: boolean;
  public correlationHeaderExcludedDomains?: string[];
  public disableFlushOnBeforeUnload?: boolean;
  public enableSessionStorageBuffer?: boolean;
  public isCookieUseDisabled?: boolean;
  public cookieDomain?: string;
  public isRetryDisabled?: boolean;
  public url?: string;
  public isStorageUseDisabled?: boolean;
  public isBeaconApiDisabled?: boolean;
  public sdkExtension?: string;
  public isBrowserLinkTrackingEnabled?: boolean;
  public appId?: string;
  public enableCorsCorrelation?: boolean;
}

@Injectable()
export class MonitoringService implements IMonitoringService {

  constructor(
    private readonly _http: HttpClient,
    @Optional() private _config?: MonitorConfig,
    @Optional() private readonly _appInsights?: AbstractAppInsights
  ) {
    if (!appInsights) {
      appInsights = AppInsights;
    }
  }

  public logPageView(
      name?: string,
      url?: string,
      properties?: any,
      measurements?: any,
      duration?: number
  ): void {
    this.send(() => {
      this._appInsights.trackPageView(name, url, properties, measurements, duration);
    });
  }

  public logEvent(name: string, properties?: any, measurements?: any): void {
    this.send(() => {
      this._appInsights.trackEvent(name, properties, measurements);
    });
  }

  public logException(exception: Error): void {
    this.send(() => {
      this._appInsights.trackException(exception);
    });
  }

  private send(func: () => any): void {
    if (this._config && this._config.instrumentationKey) {
      func();
    } else {
      this._http.get<any>('/api/monitoring-tools').subscribe(it => {
        this._config = {
          instrumentationKey: it['key']
        };
        if (!this._appInsights.config) {
          this._appInsights.downloadAndSetup(this._config);
        }
        func();
      });
    }
  }
}
