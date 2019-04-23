// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import { OrgPendingComponent } from 'src/org-pending/org-pending.component';

export const ROUTES: Routes = [
  {
    path: 'pending',
    component: OrgPendingComponent,
    canActivate: [
    ],
  }
];


export const orgPendingRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
