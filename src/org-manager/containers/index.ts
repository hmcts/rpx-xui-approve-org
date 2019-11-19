import { ActiveOrganisationsComponent } from './overview/active-organisations.component';
import { OrgOverviewComponent } from './org-overview/org-overview.component';
import { OverviewPendingComponent } from './overview-pending/pending-overview.component';
import { OrgPendingOverviewComponent } from './org-pending-overview/org-pending-overview.component';
import { OrgPendingApproveComponent } from './org-pending-approve/org-pending-approve.component';
import { OrgApprovalSuccessComponent } from './org-success/org-approval-success.component';

export const containers: any[] = [
  ActiveOrganisationsComponent,
  OrgOverviewComponent,
  OverviewPendingComponent,

  OrgPendingOverviewComponent,
  OrgPendingApproveComponent,
  OrgApprovalSuccessComponent
];

export * from './overview/active-organisations.component';
export * from './org-overview/org-overview.component';
export * from './../../org-manager/containers/overview-pending/pending-overview.component';




