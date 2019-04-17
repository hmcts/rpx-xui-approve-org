// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {OverviewComponent} from './components/overview/org-overview.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: OverviewComponent,
    canActivate: [
    ]
  }
];

export const orgPendingRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
