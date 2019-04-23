import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';



import {HttpClientModule} from '@angular/common/http';
import { OrgPendingComponent } from './org-pending.component';
import {orgPendingRouting} from './org-pending';


export const COMPONENTS = [ OrgPendingComponent];


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
