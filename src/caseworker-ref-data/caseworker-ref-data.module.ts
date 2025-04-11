import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { SharedModule } from '../shared/shared.module';
import { caseWorkerRefDataRouting } from './caseworker-ref-data.routing';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import * as fromServices from './services';

@NgModule({ exports: [...fromContainers.containers],
  declarations: [...fromContainers.containers, ...fromComponents.components], imports: [CommonModule,
    caseWorkerRefDataRouting,
    SharedModule,
    ExuiCommonLibModule,
    FormsModule], providers: [...fromServices.services, provideHttpClient(withInterceptorsFromDi())] })
export class CaseWorkerRefDataModule {}
