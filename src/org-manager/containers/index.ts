import { ActiveOrganisationsComponent } from './active-organisations';
import { ApproveOrganisationComponent } from './approve-organisation';
import { ApproveOrganisationSuccessComponent } from './approve-organisation-success';
import { DeleteOrganisationComponent } from './delete-organisation';
import { DeleteOrganisationSuccessComponent } from './delete-organisation-success';
import { EditDetailsComponent } from './edit-details';
import { HomeComponent } from './home';
import { OrganisationDetailsComponent } from './organisation-details';
import { PendingOrganisationsComponent } from './pending-organisations';
import { PendingPBAsComponent } from './pending-pbas';
import { ReinviteUserComponent } from './reinvite-user';
import { ReinviteUserSuccessComponent } from './reinvite-user-success';
import { SearchOrganisationsFormComponent } from './search-organisations-form';
import { UserDetailsComponent } from './user-details';

export const containers: any[] = [
  ActiveOrganisationsComponent,
  ApproveOrganisationComponent,
  ApproveOrganisationSuccessComponent,
  DeleteOrganisationComponent,
  DeleteOrganisationSuccessComponent,
  EditDetailsComponent,
  OrganisationDetailsComponent,
  HomeComponent,
  PendingOrganisationsComponent,
  PendingPBAsComponent,
  ReinviteUserComponent,
  ReinviteUserSuccessComponent,
  SearchOrganisationsFormComponent,
  UserDetailsComponent
];

export * from './active-organisations/active-organisations.component';
export * from './pending-organisations/pending-organisations.component';
