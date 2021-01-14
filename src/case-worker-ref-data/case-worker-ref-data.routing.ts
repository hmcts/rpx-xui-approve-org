import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../services/auth/auth.guard';
import { CaseWorkerRefDataHomeComponent } from './containers/case-worker-ref-home/case-worker-ref-home.component';
import { ModuleWithProviders } from '@angular/core';
import { UploadInfoDetailsComponent } from './components/upload-info-details/upload-info-details.component';
import { UploadInfoPartialSuccessComponent } from './components/upload-info-partial-success/upload-info-partial-success';

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

export const caseWorkerRefDataRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
