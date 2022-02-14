import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrganisationVM } from 'src/org-manager/models/organisation';

@Component({
  selector: 'app-new-pbas-confirm',
  templateUrl: './new-pbas-confirm.component.html'
})
export class NewPBAsConfirmComponent {

  @Input() public org: OrganisationVM;
  @Input() public formControls: FormControl[];
  @Input() public newPBAs: Map<string, string>;

  constructor() {

  }
}
