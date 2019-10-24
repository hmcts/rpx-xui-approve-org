// routes
import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrgPendingApproveComponent } from 'src/org-manager/containers/org-pending-approve/org-pending-approve.component';
import { OrgPendingOverviewComponent } from 'src/org-manager/containers/org-pending-overview/org-pending-overview.component';
import { OrgPendingSummaryComponent } from 'src/org-manager/containers/org-pending-summary/org-pending-summary.component';
import { OrgApprovalSuccessComponent } from 'src/org-manager/containers/org-success/org-approval-success.component';
import { OverviewPendingComponent } from 'src/org-manager/containers/overview-pending/pending-overview.component';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { OrgOverviewComponent } from './containers/org-overview/org-overview.component';
import { OrgSummaryComponent } from './containers/org-summary/org-summary.component';
import { OverviewComponent } from './containers/overview/org-overview.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: OverviewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organisations/organisation',
    component: OrgOverviewComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: ':id',
        component: OrgSummaryComponent,
        canActivate: [
        ]
      }
    ]
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
  }
];

export const orgManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
