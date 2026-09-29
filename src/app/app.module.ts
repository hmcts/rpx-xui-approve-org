import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
// ngrx
import { StoreModule } from '@ngrx/store';
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
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { DefaultErrorHandler } from 'src/shared/errorHandler/defaultErrorHandler';
import { AuthService } from '../services/auth/auth.service';
import { CryptoWrapper } from './services/cryptoWrapper';
import { JwtDecodeWrapper } from './services/jwtDecodeWrapper';
import { LoggerService } from './services/logger.service';
import { MonitoringService } from './services/monitoring.service';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { EnvironmentConfig } from '../models/environmentConfig.model';
import { initApplication } from './app-initilizer';
import { EnvironmentService } from './services/environment.service';
import { LogOutKeepAliveService } from './services/keep-alive/keep-alive.service';
import { RpxTranslationModule } from 'rpx-xui-translation';

export function launchDarklyClientIdFactory(envConfig: EnvironmentConfig): string {
  return envConfig.launchDarklyClientId || '';
}

export const STORE_RUNTIME_CHECKS = {
  strictStateImmutability: true,
  strictActionImmutability: true
};

@NgModule({
  declarations: [
    AppComponent,
    ...fromComponents.components,
    ...fromContainers.containers
  ],
  bootstrap: [AppComponent],
  imports: [BrowserModule,
    CookieModule.withOptions(),
    RouterModule.forRoot(ROUTES, {
      anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled', onSameUrlNavigation: 'reload'
      //relativeLinkResolution: 'legacy'
    }),
    StoreModule.forRoot(reducers, { runtimeChecks: STORE_RUNTIME_CHECKS }),
    EffectsModule.forRoot(effects),
    SharedModule,
    StoreRouterConnectingModule.forRoot(),
    OrgManagerModule,
    environment?.production ? [] : StoreDevtoolsModule.instrument({ logOnly: true }),
    LoggerModule.forRoot({
      level: NgxLoggerLevel.TRACE,
      disableConsoleLogging: false
    }),
    ExuiCommonLibModule,
    NgIdleKeepaliveModule.forRoot(),
    RpxTranslationModule.forRoot({
      baseUrl: '/api/translation',
      debounceTimeMs: 300,
      validity: {
        days: 1
      },
      testMode: false
    })],
  providers: [
    LogOutKeepAliveService,
    { provide: RouterStateSerializer, useClass: CustomSerializer },
    AuthService,
    CryptoWrapper, JwtDecodeWrapper, MonitoringService, LoggerService,
    { provide: ErrorHandler, useClass: DefaultErrorHandler },
    {
      provide: APP_INITIALIZER,
      useFactory: initApplication,
      deps: [EnvironmentService],
      multi: true
    },
    { provide: FeatureToggleService, useClass: LaunchDarklyService },
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule { }
