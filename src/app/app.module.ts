import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
// ngrx
import { MetaReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { storeFreeze } from 'ngrx-store-freeze';
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

import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import config from 'config';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
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

export const metaReducers: MetaReducer<any>[] = !config.production
  ? [storeFreeze]
  : [];


@NgModule({
  declarations: [
    AppComponent,
    ...fromComponents.components,
    ...fromContainers.containers,
  ],
  imports: [
    BrowserModule,
    CookieModule.forRoot(),
    RouterModule.forRoot(ROUTES),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot(effects),
    SharedModule,
    StoreRouterConnectingModule,
    OrgManagerModule,
    !environment.production ? StoreDevtoolsModule.instrument({ logOnly: true }) : [],
    LoggerModule.forRoot({
      level: NgxLoggerLevel.TRACE,
      disableConsoleLogging: false
    }),
    ExuiCommonLibModule.forRoot(),
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
