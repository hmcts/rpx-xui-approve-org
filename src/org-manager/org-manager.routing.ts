// routes
import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { OverviewComponent } from './containers/overview/org-overview.component';
import { OrgOverviewComponent } from './containers/org-overview/org-overview.component';
import { OrgSummaryComponent } from './containers/org-summary/org-summary.component';
import { OverviewPendingComponent } from 'src/org-manager/containers/overview-pending/pending-overview.component';
import { OrgPendingOverviewComponent } from 'src/org-manager/containers/org-pending-overview/org-pending-overview.component';
import { OrgPendingApproveComponent } from 'src/org-manager/containers/org-pending-approve/org-pending-approve.component';
import { OrgApprovalSuccessComponent } from 'src/org-manager/containers/org-success/org-approval-success.component';
import { AuthGuard } from 'src/services/auth/auth.guard';
import {OrganisationDetailsComponent} from './components';

export const ROUTES: Routes = [
  {
    path: '',
    component: OverviewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'pending-organisations',
    component: OrgPendingOverviewComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: OverviewPendingComponent,
      },
      {
        path: 'approve',
        component: OrgPendingApproveComponent
      },
      {
        path: 'approve-success',
        component: OrgApprovalSuccessComponent
      }
    ]
  },
  {
    path: 'organisation-details/:id',
    component: OrganisationDetailsComponent,
    canActivate: [],
  },
];

export const orgManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
