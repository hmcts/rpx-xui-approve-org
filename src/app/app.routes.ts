import { Routes } from '@angular/router';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { AccessibilityComponent, CookiePolicyComponent, PrivacyPolicyComponent, TermsAndConditionsComponent } from './components';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'organisation',
    pathMatch: 'full',
  },
  {
    path: 'organisation',
    canActivate: [AuthGuard],
    loadChildren: '../org-manager/org-manager.module#OrgManagerModule'
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
    path: '**',
    redirectTo: 'organisation',
    pathMatch: 'full'
  }
];

