import { Routes } from '@angular/router';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { AccessibilityComponent, CookiePolicyComponent, PrivacyPolicyComponent, TermsAndConditionsComponent } from './components';
import {ServiceDownComponent} from './components/service-down/service-down.component';
import { SignedOutComponent } from './components/signed-out/signed-out.component';
import { RoleGuard } from '@hmcts/rpx-xui-common-lib';
import { RedirectComponent } from './containers';

export const ROUTES: Routes = [
  {
    path: '',
    component: RedirectComponent,
    canActivate: [AuthGuard],
    pathMatch: 'full',
  },
  {
    path: 'caseworker-details',
    canActivate: [AuthGuard, RoleGuard],
    loadChildren: '../case-worker-ref-data/case-worker-ref-data.module#CaseWorkerRefDataModule',
    data: {needsRole: ['cwd-admin'], roleMatching: 0 }
  },
  {
    canActivate: [AuthGuard],
    path: 'home',
    component: RedirectComponent
  },
  {
    path: 'organisation',
    canActivate: [AuthGuard, RoleGuard],
    loadChildren: '../org-manager/org-manager.module#OrgManagerModule',
    data: {needsRole: ['prd-admin'], roleMatching: 0 }
  },
  {
    path: 'cookies',
    component: CookiePolicyComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'terms-and-conditions',
    component: TermsAndConditionsComponent
  },
  {
    path: 'accessibility',
    component: AccessibilityComponent
  },
  {
    path: 'service-down',
    component: ServiceDownComponent
  },
  {
    path: 'signed-out',
    component: SignedOutComponent
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

