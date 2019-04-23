// routes
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import { DashboardComponent } from 'src/dashboard/dashboard.component';

export const ROUTES: Routes = [
  {
    path: 'pending',
    component: DashboardComponent,
    canActivate: [
    ],
  }
];


export const dashboardManagerRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
