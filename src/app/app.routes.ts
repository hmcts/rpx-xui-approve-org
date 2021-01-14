import { AccessibilityComponent, CookiePolicyComponent, PrivacyPolicyComponent, TermsAndConditionsComponent } from './components';

import { AuthGuard } from 'src/services/auth/auth.guard';
import { NotAuthorisedComponent } from './components/not-authorised/not-authorised.component';
import { RedirectComponent } from './containers';
import { RoleGuard } from '@hmcts/rpx-xui-common-lib';
import { Routes } from '@angular/router';
import {ServiceDownComponent} from './components/service-down/service-down.component';
import { SignedOutComponent } from './components/signed-out/signed-out.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: RedirectComponent,
    canActivate: [AuthGuard],
    pathMatch: 'full',
  },
  {
    path: 'caseworker-details',
    canActivate: [AuthGuard],
    loadChildren: '../case-worker-ref-data/case-worker-ref-data.module#CaseWorkerRefDataModule'
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
    data: ['prd-admin']
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
    path: 'not-authorised',
    component: NotAuthorisedComponent
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

