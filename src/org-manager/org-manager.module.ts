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
import { OrgPendingModule } from 'src/org-pending/org-pending.module';
import { NotificationBannerComponent } from 'src/notification-banner/notification-banner.component';

export const COMPONENTS = [ OrgOverviewComponent, OrgSummaryComponent, NotificationBannerComponent];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    orgManagerRouting,
    SharedModule,
    StoreModule.forFeature('organisations', reducers),
    EffectsModule.forFeature(effects),
    OrgPendingModule
  ],
  exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers, ...COMPONENTS],
  providers: [...fromServices.services]
})

export class OrgManagerModule {

}
