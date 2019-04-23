import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {orgManagerRouting} from './org-manager.routing';
import {SharedModule} from '../shared/shared.module';

// containers
import * as fromContainers from './containers';

// services
import * as fromServices from './services';
import {StoreModule} from '@ngrx/store';

import {HttpClientModule} from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { reducers, effects } from './store';
import { OrgOverviewComponent } from './containers/org-overview/org-overview.component';
import { OrgSummaryComponent } from './containers/org-summary/org-summary.component';
import { OrgPendingModule } from 'src/notification-banner/notification-banner';
import { DashboardModule } from 'src/dashboard/dashboard.module';

export const COMPONENTS = [ OrgOverviewComponent, OrgSummaryComponent];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    orgManagerRouting,
    SharedModule,
    StoreModule.forFeature('organisations', reducers),
    EffectsModule.forFeature(effects),
    OrgPendingModule,
    DashboardModule
  ],
  exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers, ...COMPONENTS],
  providers: [...fromServices.services]
})

export class OrgManagerModule {

}
