import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../shared/shared.module';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import { orgManagerRouting } from './org-manager.routing';
import * as fromPipes from './pipes';
import * as fromServices from './services';
import { effects, reducers } from './store';

@NgModule({ exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers, ...fromComponents.components, ...fromPipes.pipes], imports: [CommonModule,
    orgManagerRouting,
    SharedModule,
    StoreModule.forFeature('orgState', reducers),
    EffectsModule.forFeature(effects),
    ExuiCommonLibModule], providers: [...fromServices.services, provideHttpClient(withInterceptorsFromDi())] })

export class OrgManagerModule {

}
