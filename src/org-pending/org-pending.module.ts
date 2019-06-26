import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import * as fromServices from './../org-manager/services'
import { HttpClientModule } from '@angular/common/http';
import { orgPendingRouting } from './org-pending';
import { StoreModule } from '@ngrx/store';
import { reducers } from '././../org-manager/store/reducers/index'
import { effects } from '././../org-manager/store/effects/index'
import { EffectsModule } from '@ngrx/effects';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    orgPendingRouting,
    StoreModule.forFeature('organisations', reducers),
    EffectsModule.forFeature(effects)
  ],
  exports: [],
  declarations: [],
  providers: [...fromServices.services]
})

export class OrgPendingModule {

}
