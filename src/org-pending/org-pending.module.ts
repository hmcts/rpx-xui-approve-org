import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';



import {HttpClientModule} from '@angular/common/http';
import {orgPendingRouting} from './org-pending';
import { PendingOverviewComponent } from './containers';
import { StoreModule } from '@ngrx/store';
import { reducer } from './state/org-pending.reducer';


export const COMPONENTS = [PendingOverviewComponent];


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    orgPendingRouting,
    StoreModule.forFeature('org-pending',reducer)
  ],
  exports: [],
  declarations: [...COMPONENTS],
  providers: []
})

export class OrgPendingModule {

}
