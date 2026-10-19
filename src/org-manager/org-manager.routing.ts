import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard, RoleMatching } from '@hmcts/rpx-xui-common-lib';

import { AuthGuard } from '../services/auth/auth.guard';
import { ActiveOrganisationsComponent } from './containers';
import { ApproveOrganisationComponent } from './containers/approve-organisation';
import { ApproveOrganisationSuccessComponent } from './containers/approve-organisation-success';
import { DeleteOrganisationComponent } from './containers/delete-organisation';
import { DeleteOrganisationSuccessComponent } from './containers/delete-organisation-success';
import { EditDetailsComponent } from './containers/edit-details';
import { HomeComponent } from './containers/home';
import { NewPBAsComponent } from './containers/new-pbas';
import { OrganisationDetailsComponent } from './containers/organisation-details';
import { PendingOrganisationsComponent } from './containers/pending-organisations';
import { PendingPBAsComponent } from './containers/pending-pbas';
import { ReinviteUserComponent } from './containers/reinvite-user';
import { ReinviteUserSuccessComponent } from './containers/reinvite-user-success';
import { ReviewOrganisationComponent } from './containers/review-organisation';
import { UserDetailsComponent } from './containers/user-details';
import { UserApprovalGuard } from './guards';

export const ROUTES: Routes = [
  {
    path: 'organisation',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pending'
      },
      {
        path: 'pending',
        component: PendingOrganisationsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { needsRole: ['prd-admin'], roleMatching: RoleMatching.ALL, title: 'New Registrations' }
      },
      {
        path: 'pbas',
        component: PendingPBAsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { needsRole: ['prd-admin'], roleMatching: RoleMatching.ALL, title: 'New PBAs' }
      },
      {
        path: 'active',
        component: ActiveOrganisationsComponent,
        canActivate: [AuthGuard], data: { title: 'Active Organisations' }
      }
    ]
  },
  {
    path: 'pbas/new/:orgId',
    component: NewPBAsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { needsRole: ['prd-admin'], roleMatching: RoleMatching.ALL, title: 'Approve New PBA Number' }
  },
  { path: 'pending-organisations', pathMatch: 'full', redirectTo: 'organisation/pending' },
  { path: 'active-organisation', pathMatch: 'full', redirectTo: 'organisation/active' },
  {
    path: 'approve-organisations',
    component: ApproveOrganisationComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Confirm Organisation Approval'
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
    path: 'delete-organisation',
    component: DeleteOrganisationComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Delete Organisation'
    }
  },
  {
    path: 'delete-organisation-success',
    component: DeleteOrganisationSuccessComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Organisation Deleted'
    }
  },
  {
    path: 'review-organisation',
    component: ReviewOrganisationComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Confirm Organisation Review'
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
    data: { title: 'Change Organisation PBA Numbers' }
  },
  {
    path: 'change/:fields/:orgId/:id',
    component: EditDetailsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Change Organisation PBA Number' }
  },
  {
    path: 'user-details',
    component: UserDetailsComponent,
    canActivate: [AuthGuard, UserApprovalGuard],
    data: { title: 'User Details' }
  },
  {
    path: 'reinvite-user',
    component: ReinviteUserComponent,
    canActivate: [AuthGuard, UserApprovalGuard],
    data: { title: 'Invite User' }
  },
  {
    path: 'reinvite-user-success',
    component: ReinviteUserSuccessComponent,
    canActivate: [AuthGuard, UserApprovalGuard],
    data: { title: 'User Invitation Sent' }
  }
];

export const orgManagerRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(ROUTES);
