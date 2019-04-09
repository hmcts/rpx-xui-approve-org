// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {AuthGuard} from '../auth/guards/auth.guard';
import {OverviewComponent} from './containers/overview/org-overview.component';
import {AccountOverviewComponent} from './containers/account-overview/account-overview.component';
import {AccountSummaryComponent} from './containers/account-summary/account-summary.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: OverviewComponent,
    canActivate: [
      AuthGuard
    ],
  },
  {
    path: 'test-organisation',
    component: AccountOverviewComponent,
    canActivate: [
      AuthGuard
    ],
    children: [
      {
        path: ':id',
        component: AccountSummaryComponent,
        canActivate: [
        ]
      }
    ]
  }
];


export const orgManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
