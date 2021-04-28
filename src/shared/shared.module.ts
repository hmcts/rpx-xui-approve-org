import { NgModule } from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { LoggerService } from 'src/app/services/logger.service';
import {IdentityBarComponent} from './components/identity-bar/identity-bar.component';
import { PhaseBannerComponent } from './components/phase-banner/phase-banner.component';
import { DefaultErrorHandler } from './errorHandler/defaultErrorHandler';
import { HealthCheckGuard } from './guards/health-check.guard';
import { HealthCheckService } from './services/health-check.service';

@NgModule( {
  imports: [
    ReactiveFormsModule,
    ExuiCommonLibModule.forChild()
  ],
  exports: [
    ReactiveFormsModule,
    IdentityBarComponent,
    PhaseBannerComponent
  ],
  declarations: [
    IdentityBarComponent,
    PhaseBannerComponent
  ],
  providers: [
    HealthCheckGuard,
    HealthCheckService,
    LoggerService,
    DefaultErrorHandler
  ]
})
export class SharedModule {
}
