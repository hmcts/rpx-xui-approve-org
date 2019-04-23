import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';



import {HttpClientModule} from '@angular/common/http';
import {orgPendingRouting} from './org-pending';
import { OverviewComponent } from './containers';


export const COMPONENTS = [OverviewComponent];


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    orgPendingRouting
  ],
  exports: [],
  declarations: [...COMPONENTS],
  providers: []
})

export class OrgPendingModule {

}
