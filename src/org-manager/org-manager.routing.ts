import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApproveOrganisationSuccessComponent } from 'src/org-manager/containers/approve-organisation-success/approve-organisation-success.component';
import { ApproveOrganisationComponent } from 'src/org-manager/containers/approve-organisation/approve-organisation.component';
import { PendingOrganisationsComponent} from 'src/org-manager/containers/pending-organisations/pending-organisations.component';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { OrganisationDetailsComponent } from './components';
import { ActiveOrganisationsComponent } from './containers';
import { EditDetailsComponent } from './containers/edit-details/edit-details.component';
import { InviteUserComponent } from './containers/invite-user/invite-user.component';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'pending-organisations',
    pathMatch: 'full',
  },
  {
    path: 'active-organisation',
    component: ActiveOrganisationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'pending-organisations',
    component: PendingOrganisationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'approve-organisations',
    component: ApproveOrganisationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'approve-organisations-success',
    component: ApproveOrganisationSuccessComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organisation-details/:orgId',
    component: OrganisationDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change/:fields/:orgId',
    component: EditDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change/:fields/:orgId/:id',
    component: EditDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'invite-user',
    component: InviteUserComponent,
    canActivate: [AuthGuard],
  },
];

export const orgManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
