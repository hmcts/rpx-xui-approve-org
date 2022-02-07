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
        data: { needsRole: ['prd-admin'], roleMatching: RoleMatching.ALL, title: 'Pending organisations' }
      },
      {
        path: 'pbas',
        component: PendingPBAsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { needsRole: ['prd-admin'], roleMatching: RoleMatching.ALL, title: 'Pending PBAs' }
      },
      {
        path: 'active',
        component: ActiveOrganisationsComponent,
        canActivate: [AuthGuard], data: { title: 'Active organisations' }
      }
    ]
  },
  {
    path: 'pbas/new/:orgId',
    component: NewPBAsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { needsRole: ['prd-admin'], roleMatching: RoleMatching.ALL, title: 'New PBAs' }
  },
  { path: 'pending-organisations', pathMatch: 'full', redirectTo: 'organisation/pending' },
  { path: 'active-organisation', pathMatch: 'full', redirectTo: 'organisation/active' },
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

export const orgManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
