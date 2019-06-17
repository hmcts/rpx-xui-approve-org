// routes
import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { OverviewComponent } from 'src/org-pending/containers/overview/pending-overview.component';
import { OrgPendingOverviewComponent } from './containers/org-pending-overview/org-pending-overview.component';
import { OrgPendingSummaryComponent } from './containers/org-pending-summary/org-pending-summary.component';
import { OrgPendingApproveComponent } from './containers/org-pending-approve/org-pending-approve.component';
import { OrgApprovalSuccessComponent } from './containers/org-success/org-approval-success.component';

export const ROUTES: Routes = [
  {
    path: 'pending-organisations',
    component: OrgPendingOverviewComponent,
    canActivate: [
    ],
    children: [
      {
        path: '',
        component: OverviewComponent,
      },
      {
        path: 'organisation/:id',
        component: OrgPendingSummaryComponent
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
];

export const orgPendingRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
