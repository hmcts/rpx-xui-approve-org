import { OrgPendingApproveComponent } from './../../org-manager/containers/org-pending-approve/org-pending-approve.component';
import { OrgPendingOverviewComponent } from './../../org-manager/containers/org-pending-overview/org-pending-overview.component';
import { OrgPendingSummaryComponent } from './../../org-manager/containers/org-pending-summary/org-pending-summary.component';
import { OrgApprovalSuccessComponent } from './../../org-manager/containers/org-success/org-approval-success.component';
import { OverviewPendingComponent } from './../../org-manager/containers/overview-pending/pending-overview.component';
import { OrgOverviewComponent } from './org-overview/org-overview.component';
import { OrgSummaryComponent } from './org-summary/org-summary.component';
import { OverviewComponent } from './overview/org-overview.component';

export const containers: any[] = [
  OverviewComponent,
  OrgOverviewComponent,
  OrgSummaryComponent,
  OverviewPendingComponent,
  OrgPendingSummaryComponent,
  OrgPendingOverviewComponent,
  OrgPendingApproveComponent,
  OrgApprovalSuccessComponent
];

export * from './../../org-manager/containers/org-pending-summary/org-pending-summary.component';
export * from './../../org-manager/containers/overview-pending/pending-overview.component';
export * from './org-overview/org-overview.component';
export * from './org-summary/org-summary.component';
export * from './overview/org-overview.component';




