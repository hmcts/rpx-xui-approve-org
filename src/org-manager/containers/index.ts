import { ActiveOrganisationsComponent } from './active-organisations/active-organisations.component';
import { PendingOrganisationsComponent } from './pending-organisations/pending-organisations.component';
import { ApproveOrganisationComponent } from './approve-organisation/approve-organisation.component';
import { ApproveOrganisationSuccessComponent } from './approve-organisation-success/approve-organisation-success.component';
import {ChangeDetailsComponent} from './change-details/change-details.component';

export const containers: any[] = [
  ActiveOrganisationsComponent,
  PendingOrganisationsComponent,
  ApproveOrganisationComponent,
  ApproveOrganisationSuccessComponent,
  ChangeDetailsComponent
];

export * from './active-organisations/active-organisations.component';
export * from './pending-organisations/pending-organisations.component';




