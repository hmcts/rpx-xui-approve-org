import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {orgManagerRouting} from './org-manager.routing';
import {SharedModule} from '../shared/shared.module';

// containers
import * as fromContainers from './containers';

// components
import * as fromComponents from './components';

// services
import * as fromServices from './services';
import {StoreModule} from '@ngrx/store';
import {HttpClientModule} from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { reducers, effects } from './store';
import { OrgPendingModule } from 'src/org-pending/org-pending.module';

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
  declarations: [...fromContainers.containers, ...fromComponents.components],
  providers: [...fromServices.services]
})

export class OrgManagerModule {

}
