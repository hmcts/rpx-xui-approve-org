import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard, RoleMatching, UserDetailsComponent } from '@hmcts/rpx-xui-common-lib';

import { AuthGuard } from '../services/auth/auth.guard';
import { ActiveOrganisationsComponent, ApproveOrganisationComponent, ApproveOrganisationSuccessComponent, DeleteOrganisationComponent, DeleteOrganisationSuccessComponent, EditDetailsComponent, HomeComponent, NewPBAsComponent, OrganisationDetailsComponent, OrganisationUpdateDecisionComponent, OrganisationUpdateReviewComponent, OrganisationUpdatesComponent, PendingOrganisationsComponent, PendingPBAsComponent, ReinviteUserComponent, ReinviteUserSuccessComponent, ReviewOrganisationComponent } from './containers';
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
      },
      {
        path: 'updates',
        component: OrganisationUpdatesComponent,
        canActivate: [AuthGuard], data: { title: 'Organisation updates' }
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
  { path: 'organisation-updates', pathMatch: 'full', redirectTo: 'organisation/updates' },
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
    path: 'review-organisation',
    component: ReviewOrganisationComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Review organisation'
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
    path: 'organisation-update/:orgId',
    component: OrganisationUpdateReviewComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Review organisation details'
    }
  },
  {
    path: 'organisation-update-accepted',
    component: OrganisationUpdateDecisionComponent,
    canActivate: [AuthGuard],
    data: {
      decision: 'accepted',
      title: 'Organisation update accepted'
    }
  },
  {
    path: 'organisation-update-rejected',
    component: OrganisationUpdateDecisionComponent,
    canActivate: [AuthGuard],
    data: {
      decision: 'rejected',
      title: 'Organisation update rejected'
    }
  },
  {
    path: 'change/:fields/:orgId',
    component: EditDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'change/:fields/:orgId/:id',
    component: EditDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user-details',
    component: UserDetailsComponent,
    canActivate: [AuthGuard, UserApprovalGuard]
  },
  {
    path: 'reinvite-user',
    component: ReinviteUserComponent,
    canActivate: [AuthGuard, UserApprovalGuard]
  },
  {
    path: 'reinvite-user-success',
    component: ReinviteUserSuccessComponent,
    canActivate: [AuthGuard, UserApprovalGuard]
  }
];

export const orgManagerRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(ROUTES);
