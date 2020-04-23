import { ActiveOrganisationsComponent } from './active-organisations/active-organisations.component';
import { ApproveOrganisationSuccessComponent } from './approve-organisation-success/approve-organisation-success.component';
import { ApproveOrganisationComponent } from './approve-organisation/approve-organisation.component';
import {EditDetailsComponent} from './edit-details/edit-details.component';
import { PendingOrganisationsComponent } from './pending-organisations/pending-organisations.component';
import { ReinviteUserSuccessComponent } from './reinvite-user-success/reinvite-user-success.component';
import { ReinviteUserComponent } from './reinvite-user/reinvite-user.component';
import { SearchOrganisationsFormComponent } from './search-organisations-form/search-organisations-form.component';
import { UserDetailsComponent } from './user-details/user-details.component';

export const containers: any[] = [
  ActiveOrganisationsComponent,
  PendingOrganisationsComponent,
  ApproveOrganisationComponent,
  ApproveOrganisationSuccessComponent,
  SearchOrganisationsFormComponent,
  EditDetailsComponent,
  ReinviteUserComponent,
  ReinviteUserSuccessComponent,
  UserDetailsComponent
];

export * from './active-organisations/active-organisations.component';
export * from './pending-organisations/pending-organisations.component';




