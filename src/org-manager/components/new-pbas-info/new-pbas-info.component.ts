import { Component, Input } from '@angular/core';
import { OrganisationVM } from 'src/org-manager/models/organisation';

@Component({
  selector: 'app-new-pbas-info',
  templateUrl: './new-pbas-info.component.html'
})
export class NewPBAsInfoComponent {

  @Input() public org: OrganisationVM;

  constructor() {

  }
}
