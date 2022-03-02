import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule, DefaultRouterStateSerializer } from '@ngrx/router-store';
// ngrx
import { MetaReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { CookieModule } from 'ngx-cookie';
import { environment } from '../environments/environment';
import { SharedModule } from '../shared/shared.module';
import { AppComponent } from './containers/app/app.component';
import { CustomSerializer, reducers } from './store/';
import { effects } from './store/effects';

// from Containers
import * as fromContainers from './containers/';

// from Components
import * as fromComponents from './components';

import { ROUTES } from './app.routes';

import { OrgManagerModule } from 'src/org-manager/org-manager.module';

import { ExuiCommonLibModule, FeatureToggleService, LaunchDarklyService } from '@hmcts/rpx-xui-common-lib';
import config from 'config';
import { DefaultErrorHandler } from 'src/shared/errorHandler/defaultErrorHandler';
import {AuthService} from '../services/auth/auth.service';
import { AbstractAppInsights, AppInsightsWrapper } from './services/appInsightsWrapper';
import { CryptoWrapper } from './services/cryptoWrapper';
import { JwtDecodeWrapper } from './services/jwtDecodeWrapper';
import { LoggerService } from './services/logger.service';
import { MonitoringService } from './services/monitoring.service';

import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';
import { initApplication } from './app-initilizer';
import { EnvironmentService } from './services/environment.service';
import {LogOutKeepAliveService} from './services/keep-alive/keep-alive.service';
import { EnvironmentConfig, ENVIRONMENT_CONFIG } from '../models/environmentConfig.model'

export const metaReducers: MetaReducer<any>[] = !config.production
  ? []
  : [];

export function launchDarklyClientIdFactory(envConfig: EnvironmentConfig): string {
    return envConfig.launchDarklyClientId || '';
  }

@NgModule({
  declarations: [
    AppComponent,
    ...fromComponents.components,
    ...fromContainers.containers,
  ],
  imports: [
    BrowserModule,
    CookieModule.forRoot(),
    RouterModule.forRoot(ROUTES, {
      anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled', onSameUrlNavigation: 'reload'
    }),
    StoreModule.forRoot(reducers, { metaReducers, runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true } }),
    EffectsModule.forRoot(effects),
    SharedModule,
    StoreRouterConnectingModule.forRoot({ serializer: DefaultRouterStateSerializer }),
    OrgManagerModule,
    !environment.production ? StoreDevtoolsModule.instrument({ logOnly: true }) : [],
    ExuiCommonLibModule,
    NgIdleKeepaliveModule.forRoot()
  ],
  providers: [
    LogOutKeepAliveService,
    { provide: RouterStateSerializer, useClass: CustomSerializer },
    AuthService,
    { provide: AbstractAppInsights, useClass: AppInsightsWrapper},
    CryptoWrapper, JwtDecodeWrapper, MonitoringService, LoggerService,
    {provide: ErrorHandler, useClass: DefaultErrorHandler},
    {
      provide: APP_INITIALIZER,
      useFactory: initApplication,
      deps: [EnvironmentService],
      multi: true
    },
    { provide: FeatureToggleService, useClass: LaunchDarklyService },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
