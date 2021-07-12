import { Component, Input } from '@angular/core';

import { OrganisationVM } from '../../models/organisation';

@Component({
  selector: 'app-org-address',
  templateUrl: './organisation-address.component.html'
})
export class OrganisationAddressComponent {
  @Input() public organisation: OrganisationVM;
}
