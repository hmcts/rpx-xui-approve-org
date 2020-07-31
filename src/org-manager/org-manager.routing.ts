import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApproveOrganisationSuccessComponent } from 'src/org-manager/containers/approve-organisation-success/approve-organisation-success.component';
import { ApproveOrganisationComponent } from 'src/org-manager/containers/approve-organisation/approve-organisation.component';
import { PendingOrganisationsComponent} from 'src/org-manager/containers/pending-organisations/pending-organisations.component';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { OrganisationDetailsComponent } from './components';
import { ActiveOrganisationsComponent } from './containers';
import { EditDetailsComponent } from './containers/edit-details/edit-details.component';
import { ReinviteUserSuccessComponent } from './containers/reinvite-user-success/reinvite-user-success.component';
import { ReinviteUserComponent } from './containers/reinvite-user/reinvite-user.component';
import { UserDetailsComponent } from './containers/user-details/user-details.component';
import { UserApprovalGuard } from './guards/users-approval.guard';

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
    data: {
      title: 'Active Organisations'
    }
  },
  {
    path: 'pending-organisations',
    component: PendingOrganisationsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Pending Organisations'
    }
  },
  {
    path: 'approve-organisations',
    component: ApproveOrganisationComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Approve Organisations'
    }
  },
  {
    path: 'approve-organisations-success',
    component: ApproveOrganisationSuccessComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Organisation Approved'
    }
  },
  {
    path: 'organisation-details/:orgId',
    component: OrganisationDetailsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Organisation Details'
    }
  },
  {
    path: 'change/:fields/:orgId',
    component: EditDetailsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Edit Organisation Details'
    }
  },
  {
    path: 'change/:fields/:orgId/:id',
    component: EditDetailsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Edit Organisation Details'
    }
  },
  {
    path: 'user-details',
    component: UserDetailsComponent,
    canActivate: [AuthGuard, UserApprovalGuard],
    data: {
      title: 'User Details'
    }
  },
  {
    path: 'reinvite-user',
    component: ReinviteUserComponent,
    canActivate: [AuthGuard, UserApprovalGuard],
    data: {
      title: 'Reinvite User'
    }
  },
  {
    path: 'reinvite-user-success',
    component: ReinviteUserSuccessComponent,
    canActivate: [AuthGuard, UserApprovalGuard],
    data: {
      title: 'User Reinvited'
    }
  }
];

export const orgManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
