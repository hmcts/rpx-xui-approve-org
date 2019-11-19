import { ActiveOrganisationsComponent } from './overview/acrive-organisations.component';
import { OrgOverviewComponent } from './org-overview/org-overview.component';
import { OverviewPendingComponent } from './../../org-manager/containers/overview-pending/pending-overview.component';
import { OrgPendingOverviewComponent } from './../../org-manager/containers/org-pending-overview/org-pending-overview.component';
import { OrgPendingApproveComponent } from './../../org-manager/containers/org-pending-approve/org-pending-approve.component';
import { OrgApprovalSuccessComponent } from './../../org-manager/containers/org-success/org-approval-success.component';

export const containers: any[] = [
  ActiveOrganisationsComponent,
  OrgOverviewComponent,
  OverviewPendingComponent,

  OrgPendingOverviewComponent,
  OrgPendingApproveComponent,
  OrgApprovalSuccessComponent
];

export * from './overview/acrive-organisations.component';
export * from './org-overview/org-overview.component';
export * from './../../org-manager/containers/overview-pending/pending-overview.component';




