// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import { OverviewComponent } from 'src/org-pending/containers/overview/pending-overview.component'

export const ROUTES: Routes = [
  /*{
    path: 'pending',
    component: OrgPendingComponent,
    canActivate: [
    ],
  }*/
  {
    path: 'pending',
    component: OverviewComponent,
    canActivate: [
    ],
  }
];


export const orgPendingRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
