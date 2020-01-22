import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {orgManagerRouting} from './org-manager.routing';
import {SharedModule} from '../shared/shared.module';

// containers
import * as fromContainers from './containers';

// components
import * as fromComponents from './components';

// services
import {HttpClientModule} from '@angular/common/http';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { EffectsModule } from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import * as fromServices from './services';
import { effects, reducers } from './store';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    orgManagerRouting,
    SharedModule,
    StoreModule.forFeature('orgState', reducers),
    EffectsModule.forFeature(effects),
    ExuiCommonLibModule.forChild()
  ],
  exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers, ...fromComponents.components],
  providers: [...fromServices.services]
})

export class OrgManagerModule {

}
