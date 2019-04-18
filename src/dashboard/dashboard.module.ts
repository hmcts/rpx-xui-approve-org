import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';


import {StoreModule} from '@ngrx/store';

import {HttpClientModule} from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { DashboardComponent } from './dashboard.component';


export const COMPONENTS = [ DashboardComponent];


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,


  ],
  exports: [],
  declarations: [...COMPONENTS],
  providers: []
})

export class DashboardModule {

}
