// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import { PendingOverviewComponent } from 'src/org-pending/containers/overview/pending-overview.component'

export const ROUTES: Routes = [
  {
    path: 'pending',
    component: PendingOverviewComponent,
    canActivate: [
    ],
  }
];

export const orgPendingRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
