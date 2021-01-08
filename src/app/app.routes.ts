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
    path: 'signed-out',
    component: SignedOutComponent
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

