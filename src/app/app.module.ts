import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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

import config from 'config';

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
    StoreDevtoolsModule.instrument({
      logOnly: environment.production
    }),
  ],
  providers: [
    { provide: RouterStateSerializer, useClass: CustomSerializer }],
  bootstrap: [AppComponent]
})
export class AppModule { }
