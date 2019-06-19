import { Routes } from '@angular/router';


export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'organisation',
    pathMatch: 'full',
  },
  {
    path: 'organisations',
    loadChildren: '../org-manager/org-manager.module#OrgManagerModule'
  },
  {
    path: '**',
    redirectTo: 'organisation',
    pathMatch: 'full'
  }
];

