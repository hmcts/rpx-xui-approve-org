import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { CaseWorkerRefDataHomeComponent } from './containers/case-worker-ref-home/case-worker-ref-home.component';
import { ModuleWithProviders } from '@angular/core';
import { UploadInfoDetailsComponent } from './components/upload-info-details/upload-info-details.component';

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
    }
];

export const caseWorkerRefDataRouting: ModuleWithProviders = RouterModule.forChild(ROUTES);
