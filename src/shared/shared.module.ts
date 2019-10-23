import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoggerService } from 'src/app/services/logger.service';
import { GovUiModule } from '../../projects/gov-ui/src/lib/gov-ui.module';
import { IdentityBarComponent } from './components/identity-bar/identity-bar.component';
import { PhaseBannerComponent } from './components/phase-banner/phase-banner.component';
import { DefaultErrorHandler } from './errorHandler/defaultErrorHandler';
import { HealthCheckGuard } from './guards/health-check.guard';
import { HealthCheckService } from './services/health-check.service';

@NgModule( {
  imports: [
    ReactiveFormsModule,
    GovUiModule,
  ],
  exports: [
    ReactiveFormsModule,
    GovUiModule,
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
