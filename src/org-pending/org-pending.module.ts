import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
// import {orgPendingRouting} from './org-pending.routing';
import {SharedModule} from '../shared/shared.module';


import {HttpClientModule} from '@angular/common/http';

import { NotificationBannerComponent } from './components';

export const COMPONENTS = [NotificationBannerComponent];


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    // orgPendingRouting,
    SharedModule,
  ],
  exports: [...COMPONENTS],
  declarations: [ ...COMPONENTS],
  providers: []
})

export class OrgPendingModule {

}
