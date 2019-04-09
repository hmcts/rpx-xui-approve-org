// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {AuthGuard} from '../auth/guards/auth.guard';
import {OrganisationOverviewComponent} from './containers/overview/org-overview.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: OrganisationOverviewComponent,
    canActivate: [
      AuthGuard
    ],
  }
];


export const orgManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
