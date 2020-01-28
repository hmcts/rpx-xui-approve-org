import { ActiveOrganisationsComponent } from './active-organisations/active-organisations.component';
import { ApproveOrganisationSuccessComponent } from './approve-organisation-success/approve-organisation-success.component';
import { ApproveOrganisationComponent } from './approve-organisation/approve-organisation.component';
import {EditDetailsComponent} from './edit-details/edit-details.component';
import { PendingOrganisationsComponent } from './pending-organisations/pending-organisations.component';
import { SearchOrganisationsFormComponent } from './search-organisations-form/search-organisations-form.component';

export const containers: any[] = [
  ActiveOrganisationsComponent,
  PendingOrganisationsComponent,
  ApproveOrganisationComponent,
  ApproveOrganisationSuccessComponent,
  SearchOrganisationsFormComponent,
  EditDetailsComponent
];

export * from './active-organisations/active-organisations.component';
export * from './pending-organisations/pending-organisations.component';




