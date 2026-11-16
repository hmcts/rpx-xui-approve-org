import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OrganisationVM } from '../../models/organisation';

export type OrganisationUpdateStatus = 'PENDING' | 'CURRENT' | 'REJECTED';

@Component({
  selector: 'app-organisation-update-table',
  templateUrl: './organisation-update-table.component.html',
  styleUrls: ['./organisation-update-table.component.scss'],
  standalone: false
})
export class OrganisationUpdateTableComponent {
  @Input() public organisation: OrganisationVM = new OrganisationVM();
  @Input() public requestedStatus: OrganisationUpdateStatus = 'PENDING';
  @Output() public accept = new EventEmitter<void>();
  @Output() public reject = new EventEmitter<void>();

  public readonly currentApprovalDate = new Date('2026-11-01T12:00:00.000Z');
  public readonly currentApprovedBy = 'HMCTS Organisation Approver';
  public readonly requestedAddress = {
    addressLine1: '456 Updated Street',
    addressLine2: 'Westminster',
    addressLine3: '',
    townCity: 'London',
    postCode: 'SW1A 2AA',
    county: '',
    dxNumber: [{ dxNumber: 'DX 67890', dxExchange: 'London' }],
    sraId: 'MOCKSRA2'
  };

  public get requestedOrganisationName(): string {
    return `${this.organisation.name} Ltd`;
  }

  public onAccept(): void {
    this.accept.emit();
  }

  public onReject(): void {
    this.reject.emit();
  }
}
