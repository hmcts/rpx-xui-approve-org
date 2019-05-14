import { NgModule } from '@angular/core';
import {GovUiModule} from '../../projects/gov-ui/src/lib/gov-ui.module';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {RemoveHostDirective} from '../app/directives/remove-host.directive';

@NgModule( {
  imports: [
    ReactiveFormsModule,
    GovUiModule
  ],
  exports: [
    ReactiveFormsModule,
    GovUiModule,
  ],
  providers: [
  ]
})
export class SharedModule {
}
