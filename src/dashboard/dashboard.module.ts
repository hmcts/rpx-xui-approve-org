import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';


import {StoreModule} from '@ngrx/store';

import {HttpClientModule} from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { DashboardComponent } from './dashboard.component';
import {dashboardManagerRouting} from './dashboard.routing';


export const COMPONENTS = [ DashboardComponent];


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    dashboardManagerRouting


  ],
  exports: [],
  declarations: [...COMPONENTS],
  providers: []
})

export class DashboardModule {

}
