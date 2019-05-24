// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import { OverviewComponent } from 'src/org-pending/containers/overview/pending-overview.component';
import { OrgPendingOverviewComponent } from './containers/org-pending-overview/org-pending-overview.component';
import { OrgPendingSummaryComponent } from './containers/org-pending-summary/org-pending-summary.component';

export const ROUTES: Routes = [
  {
    path: 'pending',
    component: OverviewComponent,
    canActivate: [
    ],
  },
  {
    path: 'pending-organisations/pending-organisation',
    component: OrgPendingOverviewComponent,
    canActivate: [
    ],
    children: [
      {
        path: ':id',
        component: OrgPendingSummaryComponent,
        canActivate: [
        ]
      }
    ]
  },
];

export const orgPendingRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
