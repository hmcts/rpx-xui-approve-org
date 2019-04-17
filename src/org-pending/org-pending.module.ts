import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {orgPendingRouting} from './org-pending.routing';
import {SharedModule} from '../shared/shared.module';

import {HttpClientModule} from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    orgPendingRouting,
    SharedModule,
  ],
  exports: [],
  declarations: [],
  providers: []
})

export class OrgPendingModule {

}
