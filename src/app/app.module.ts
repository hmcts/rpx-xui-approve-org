import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './containers/app/app.component';
import { SharedModule } from '../shared/shared.module';
import { CookieModule } from 'ngx-cookie';
import { environment } from '../environments/environment';
// ngrx
import { MetaReducer, StoreModule } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { effects } from './store/effects';
import { CustomSerializer, reducers } from './store/';

// from Containers
import * as fromContainers from './containers/';

// from Components
import * as fromComponents from './components';

import { ROUTES } from './app.routes';

import { OrgManagerModule } from 'src/org-manager/org-manager.module';

import config from 'config';
import {AuthService} from '../services/auth/auth.service';
import { MonitoringService } from './services/monitoring.service';
import { AbstractAppInsights, AppInsightsWrapper } from './services/appInsightsWrapper';
import { LoggerService } from './services/logger.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { DefaultErrorHandler } from 'src/shared/errorHandler/defaultErrorHandler';
import { CryptoWrapper } from './services/cryptoWrapper';
import { JwtDecodeWrapper } from './services/jwtDecodeWrapper';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';


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
    ExuiCommonLibModule.forRoot({launchDarklyKey: ''}),
    NgIdleKeepaliveModule.forRoot()
  ],
  providers: [
    { provide: RouterStateSerializer, useClass: CustomSerializer },
    AuthService,
    { provide: AbstractAppInsights, useClass: AppInsightsWrapper},
    CryptoWrapper, JwtDecodeWrapper, MonitoringService, LoggerService,
    {provide: ErrorHandler, useClass: DefaultErrorHandler}],
  bootstrap: [AppComponent]
})
export class AppModule { }
