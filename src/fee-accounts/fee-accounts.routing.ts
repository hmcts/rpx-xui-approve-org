// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {AuthGuard} from '../auth/guards/auth.guard';
import {AccountOverviewComponent} from './containers/account-overview/account-overview.component';
import {AccountSummaryComponent} from './containers/account-summary/account-summary.component';
import {OrganisationAccountsComponent} from './containers/overview/account-overview.component';
import {AccountsGuard} from './guards/accounts.guard';
import {AccountSummaryGuard} from './guards/acccounts-summary.guards';

export const ROUTES: Routes = [
  {
    path: '',
    component: OrganisationAccountsComponent,
    canActivate: [
      AuthGuard,
      AccountsGuard
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
          AccountSummaryGuard
        ]
      }
    ]
  }
];


export const feeAccountsRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
