
import { OverviewPendingComponent } from './../../org-manager/containers/overview-pending/pending-overview.component'
import { OrgPendingOverviewComponent } from './../../org-manager/containers/org-pending-overview/org-pending-overview.component';
import { OrgPendingSummaryComponent } from './../../org-manager/containers/org-pending-summary/org-pending-summary.component';
import { OrgPendingApproveComponent } from './../../org-manager/containers/org-pending-approve/org-pending-approve.component';
import { OrgApprovalSuccessComponent } from './../../org-manager/containers/org-success/org-approval-success.component';

export const containers: any[] = [
  OverviewPendingComponent,
  OrgPendingSummaryComponent,
  OrgPendingOverviewComponent,
  OrgPendingApproveComponent,
  OrgApprovalSuccessComponent
];

export * from './../../org-manager/containers/overview-pending/pending-overview.component'
export * from './../../org-manager/containers/org-pending-summary/org-pending-summary.component';
