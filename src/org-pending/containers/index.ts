import { OverviewComponent } from './overview/pending-overview.component';
import { OrgPendingOverviewComponent } from './org-pending-overview/org-pending-overview.component';
import { OrgPendingSummaryComponent } from './org-pending-summary/org-pending-summary.component';
import { OrgPendingApproveComponent } from './org-pending-approve/org-pending-approve.component';
import { OrgApprovalSuccessComponent } from './org-success/org-approval-success.component';

export const containers: any[] = [
  OverviewComponent,
  OrgPendingSummaryComponent,
  OrgPendingOverviewComponent,
  OrgPendingApproveComponent,
  OrgApprovalSuccessComponent
];

export * from './overview/pending-overview.component';
export * from './org-pending-summary/org-pending-summary.component';
