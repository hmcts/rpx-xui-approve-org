import { NgModule } from '@angular/core';
import { AdminPanelUiComponent } from './admin-panel-ui.component';
import { AdmNavComponent } from './adm-nav/adm-nav.component';
import { RouterModule } from '@angular/router';
import { SidebarNavComponent } from './sidebar-nav/sidebar-nav.component';

@NgModule({
  declarations: [AdminPanelUiComponent, AdmNavComponent, SidebarNavComponent],
  imports: [RouterModule
  ],
  exports: [AdminPanelUiComponent,AdmNavComponent,SidebarNavComponent]
})
export class AdminPanelUiModule { }
