import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {orgManagerRouting} from './org-manager.routing';
import {SharedModule} from '../shared/shared.module';

// containers
import * as fromContainers from './containers';

// services
import {StoreModule} from '@ngrx/store';

import {HttpClientModule} from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';

export const COMPONENTS = [];


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    orgManagerRouting,
    SharedModule,
  ],
  exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers, ...COMPONENTS],
  providers: []
})

export class OrgPendingModule {

}
