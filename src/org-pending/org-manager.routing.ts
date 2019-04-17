// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {OverviewComponent} from './containers/overview/org-overview.component';
import {OrgOverviewComponent} from './containers/org-overview/org-overview.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: OverviewComponent,
    canActivate: [
    ],
  },
  {
    path: 'organisation',
    component: OrgOverviewComponent,
    canActivate: [
    ]
  }
];


export const orgManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
