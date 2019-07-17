import { NgModule } from '@angular/core';
import {GovUiModule} from '../../projects/gov-ui/src/lib/gov-ui.module';
import {ReactiveFormsModule} from '@angular/forms';
import {IdentityBarComponent} from './components/identity-bar/identity-bar.component';
import { PhaseBannerComponent } from './components/phase-banner/phase-banner.component';

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
  ]
})
export class SharedModule {
}
