import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';


import * as fromServices from './services';
import {HttpClientModule} from '@angular/common/http';
import {orgPendingRouting} from './org-pending';
import { StoreModule } from '@ngrx/store';
import { reducer } from './store/reducers/org-pending.reducer';
import { EffectsModule } from '@ngrx/effects';
import { PendingOrgEffects } from './store/effects/org-pending.effects';
import { OrgPendingOverviewComponent } from './containers/org-pending-overview/org-pending-overview.component';
import { OrgPendingSummaryComponent } from './containers/org-pending-summary/org-pending-summary.component';
// containers
import * as fromContainers from './containers';
export const COMPONENTS = [OrgPendingOverviewComponent,OrgPendingSummaryComponent];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    orgPendingRouting,
    StoreModule.forFeature('org-pending', reducer),
    EffectsModule.forFeature([PendingOrgEffects])
  ],
  exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers,...COMPONENTS],
  providers: [...fromServices.services]
})

export class OrgPendingModule {

}
