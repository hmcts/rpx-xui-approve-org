import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import * as fromServices from './services';
import { HttpClientModule } from '@angular/common/http';
import { orgPendingRouting } from './org-pending';
import { StoreModule } from '@ngrx/store';
import { reducers } from './store/reducers/index';
import { effects } from './store/effects/index';
import { EffectsModule } from '@ngrx/effects';
import * as fromContainers from './containers';
import * as fromComponents from './components';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    orgPendingRouting,
    StoreModule.forFeature('org-pending', reducers),
    EffectsModule.forFeature(effects)
  ],
  exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers, ...fromComponents.components],
  providers: [...fromServices.services]
})

export class OrgPendingModule {

}
