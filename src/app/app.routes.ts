import { Routes } from '@angular/router';


export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'organisation',
    pathMatch: 'full',
  },
  {
    path: 'organisation',
    loadChildren: '../organisation/organisation.module#OrganisationModule'
  },
  {
    path: 'users',
    loadChildren: '../users/users.module#UsersModule'
  },
  {
    path: 'profile',
    loadChildren: '../auth/auth.module#AuthModule'
  },
  {
    path: 'fee-accounts',
    loadChildren: '../fee-accounts/fee-accounts.module#FeeAccountsModule'
  },
  {
    path: 'test-organisations',
    loadChildren: '../org-manager/org-manager.module#OrgManagerModule'
  },
  {
    path: '**',
    redirectTo: '/organisation',
    pathMatch: 'full'
  }
];

