import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import * as fromContainers from './containers';
import * as fromComponents from './components';

// services
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import {caseWorkerRefDataRouting} from './caseworker-ref-data.routing';
import * as fromServices from './services';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    caseWorkerRefDataRouting,
    SharedModule,
    ExuiCommonLibModule.forChild(),
    FormsModule
  ],
  exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers, ...fromComponents.components],
  providers: [...fromServices.services]
})

export class CaseWorkerRefDataModule {

}
