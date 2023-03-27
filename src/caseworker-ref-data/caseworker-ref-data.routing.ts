import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../services/auth/auth.guard';
import { UploadInfoDetailsComponent } from './components/upload-info-details/upload-info-details.component';
import { UploadInfoPartialSuccessComponent } from './components/upload-info-partial-success/upload-info-partial-success';
import { CaseWorkerRefDataHomeComponent } from './containers/caseworker-ref-home/caseworker-ref-home.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: CaseWorkerRefDataHomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'upload-success',
    component: UploadInfoDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'partial-success',
    component: UploadInfoPartialSuccessComponent,
    canActivate: [AuthGuard]
  }
];

export const caseWorkerRefDataRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(ROUTES);
