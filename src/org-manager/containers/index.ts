import { ActiveOrganisationsComponent } from './active-organisations';
import { ApproveOrganisationComponent } from './approve-organisation';
import { ApproveOrganisationSuccessComponent } from './approve-organisation-success';
import { DeleteOrganisationComponent } from './delete-organisation';
import { DeleteOrganisationSuccessComponent } from './delete-organisation-success';
import { EditDetailsComponent } from './edit-details';
import { HomeComponent } from './home';
import { NewPBAsComponent } from './new-pbas';
import { OrganisationDetailsComponent } from './organisation-details';
import { OrganisationUpdateDecisionComponent } from './organisation-update-decision';
import { OrganisationUpdateReviewComponent } from './organisation-update-review/organisation-update-review.component';
import { OrganisationUpdatesComponent } from './organisation-updates';
import { PendingOrganisationsComponent } from './pending-organisations';
import { PendingPBAsComponent } from './pending-pbas';
import { ReinviteUserComponent } from './reinvite-user';
import { ReinviteUserSuccessComponent } from './reinvite-user-success';
import { ReviewOrganisationComponent } from './review-organisation';
import { SearchOrganisationsFormComponent } from './search-organisations-form';
import { UserDetailsComponent } from './user-details';

export const containers: any[] = [
  ActiveOrganisationsComponent,
  ApproveOrganisationComponent,
  ApproveOrganisationSuccessComponent,
  DeleteOrganisationComponent,
  ReviewOrganisationComponent,
  DeleteOrganisationSuccessComponent,
  EditDetailsComponent,
  NewPBAsComponent,
  OrganisationDetailsComponent,
  OrganisationUpdateDecisionComponent,
  OrganisationUpdateReviewComponent,
  OrganisationUpdatesComponent,
  HomeComponent,
  PendingOrganisationsComponent,
  PendingPBAsComponent,
  ReinviteUserComponent,
  ReinviteUserSuccessComponent,
  SearchOrganisationsFormComponent,
  UserDetailsComponent
];

export * from './active-organisations/active-organisations.component';
export * from './approve-organisation/approve-organisation.component';
export * from './approve-organisation-success/approve-organisation-success.component';
export * from './delete-organisation/delete-organisation.component';
export * from './delete-organisation-success/delete-organisation-success.component';
export * from './edit-details/edit-details.component';
export * from './home/home.component';
export * from './new-pbas/new-pbas.component';
export * from './organisation-details/organisation-details.component';
export * from './organisation-update-decision/organisation-update-decision.component';
export * from './organisation-update-review/organisation-update-review.component';
export * from './organisation-updates/organisation-updates.component';
export * from './pending-organisations/pending-organisations.component';
export * from './pending-pbas/pending-pbas.component';
export * from './reinvite-user/reinvite-user.component';
export * from './reinvite-user-success/reinvite-user-success.component';
export * from './review-organisation/review-organisation.component';
export * from './search-organisations-form/search-organisations-form.component';
export * from './user-details/user-details.component';
