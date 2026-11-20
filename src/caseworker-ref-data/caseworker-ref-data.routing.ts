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
    data: { title: 'Upload Staff Details' }
  },
  {
    path: 'upload-success',
    component: UploadInfoDetailsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Staff Details Uploaded' }
  },
  {
    path: 'partial-success',
    component: UploadInfoPartialSuccessComponent,
    canActivate: [AuthGuard],
    data: { title: 'Some Staff Records Were Not Updated' }
  }
];

export const caseWorkerRefDataRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(ROUTES);
