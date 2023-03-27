import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { SharedModule } from '../shared/shared.module';
import { caseWorkerRefDataRouting } from './caseworker-ref-data.routing';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import * as fromServices from './services';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    caseWorkerRefDataRouting,
    SharedModule,
    ExuiCommonLibModule,
    FormsModule
  ],
  exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers, ...fromComponents.components],
  providers: [...fromServices.services]
})
export class CaseWorkerRefDataModule {}
