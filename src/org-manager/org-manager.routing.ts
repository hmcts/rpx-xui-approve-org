import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApproveOrganisationSuccessComponent } from 'src/org-manager/containers/approve-organisation-success/approve-organisation-success.component';
import { ApproveOrganisationComponent } from 'src/org-manager/containers/approve-organisation/approve-organisation.component';
import { PendingOrganisationsComponent } from 'src/org-manager/containers/pending-organisations/pending-organisations.component';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { OrganisationDetailsComponent } from './components';
import { ActiveOrganisationsComponent } from './containers';
import { EditDetailsComponent } from './containers/edit-details/edit-details.component';
import { ReinviteUserSuccessComponent } from './containers/reinvite-user-success/reinvite-user-success.component';
import { ReinviteUserComponent } from './containers/reinvite-user/reinvite-user.component';
import { UserDetailsComponent } from './containers/user-details/user-details.component';
import { UserApprovalGuard } from './guards/users-approval.guard';
import { DeleteOrganisationComponent } from './containers/delete-organisation/delete-organisation.component';
import { DeleteOrganisationSuccessComponent } from './containers/delete-organisation-success/delete-organisation-success.component';
import { RoleGuard, RoleMatching } from '@hmcts/rpx-xui-common-lib';

export const ROUTES: Routes = [
  {
    path: 'organisation',
    component: PendingOrganisationsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      needsRole: ['prd-admin'],
      roleMatching: RoleMatching.ALL,
      title: 'Organisations'
    }
  },
  {
    path: 'pending-organisations',
    component: PendingOrganisationsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      needsRole: ['prd-admin'],
      roleMatching: RoleMatching.ALL,
      title: 'Pending organisations'
    }
  },
  {
    path: 'active-organisation',
    component: ActiveOrganisationsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Active organisations'
    }
  },
  {
    path: 'approve-organisations',
    component: ApproveOrganisationComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Check details'
    }
  },
  {
    path: 'approve-organisations-success',
    component: ApproveOrganisationSuccessComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Confirmation'
    }
  },
  {
    path: 'delete-organisation',
    component: DeleteOrganisationComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Delete organisation'
    }
  },
  {
    path: 'delete-organisation-success',
    component: DeleteOrganisationSuccessComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Delete organisation success'
    }
  },
  {
    path: 'organisation-details/:orgId',
    component: OrganisationDetailsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Organisation details'
    }
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
    path: 'user-details',
    component: UserDetailsComponent,
    canActivate: [AuthGuard, UserApprovalGuard],
  },
  {
    path: 'reinvite-user',
    component: ReinviteUserComponent,
    canActivate: [AuthGuard, UserApprovalGuard],
  },
  {
    path: 'reinvite-user-success',
    component: ReinviteUserSuccessComponent,
    canActivate: [AuthGuard, UserApprovalGuard],
  }
];

export const orgManagerRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(ROUTES);
