import { NgModule } from '@angular/core';
import {GovUiModule} from '../../projects/gov-ui/src/lib/gov-ui.module';
import {ReactiveFormsModule} from '@angular/forms';
import {IdentityBarComponent} from './components/identity-bar/identity-bar.component';

@NgModule( {
  imports: [
    ReactiveFormsModule,
    GovUiModule,
  ],
  exports: [
    ReactiveFormsModule,
    GovUiModule,
    IdentityBarComponent
  ],
  declarations: [
    IdentityBarComponent
  ],
  providers: [
  ]
})
export class SharedModule {
}
