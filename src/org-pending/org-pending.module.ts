import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';


import * as fromServices from './services';
import {HttpClientModule} from '@angular/common/http';
import {orgPendingRouting} from './org-pending';
import { PendingOverviewComponent } from './containers';
import { StoreModule } from '@ngrx/store';
import { reducer } from './state/org-pending.reducer';
import { EffectsModule } from '@ngrx/effects';
import { PendingOrgEffects } from './state/org-pending.effects';


export const COMPONENTS = [PendingOverviewComponent];


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    orgPendingRouting,
    StoreModule.forFeature('org-pending',reducer),
    EffectsModule.forFeature([PendingOrgEffects])
  ],
  exports: [],
  declarations: [...COMPONENTS],
  providers: [...fromServices.services]
})

export class OrgPendingModule {

}
