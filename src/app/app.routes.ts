import { RoleGuard, RoleMatching } from '@hmcts/rpx-xui-common-lib';
import {
  AccessibilityComponent,
  AccessDeniedComponent,
  CookiePolicyComponent,
  PrivacyPolicyComponent,
  TermsAndConditionsComponent
} from './components';

import { Routes } from '@angular/router';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { NotAuthorisedComponent } from './components/not-authorised/not-authorised.component';
import { ServiceDownComponent } from './components/service-down/service-down.component';
import { SignedOutComponent } from './components/signed-out/signed-out.component';
import { RedirectComponent } from './containers';

export const ROUTES: Routes = [
  {
    path: '',
    component: RedirectComponent,
    canActivate: [AuthGuard],
    pathMatch: 'full'
  },
  {
    path: 'caseworker-details',
    canActivate: [AuthGuard, RoleGuard],
    loadChildren: () => import('../caseworker-ref-data/caseworker-ref-data.module').then((m) => m.CaseWorkerRefDataModule),
    data: {
      needsRole: ['cwd-admin'],
      roleMatching: RoleMatching.ALL
    }
  },
  {
    canActivate: [AuthGuard],
    path: 'home',
    component: RedirectComponent
  },
  {
    path: 'organisation',
    canActivate: [AuthGuard, RoleGuard],
    loadChildren: () => import('../org-manager/org-manager.module').then((m) => m.OrgManagerModule),
    data: {
      needsRole: ['prd-admin'],
      roleMatching: RoleMatching.ALL
    }
  },
  {
    path: 'cookies',
    component: CookiePolicyComponent,
    data: {
      title: 'Cookies'
    }
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    data: {
      title: 'Privacy Policy'
    }
  },
  {
    path: 'terms-and-conditions',
    component: TermsAndConditionsComponent,
    data: {
      title: 'Terms and Conditions'
    }
  },
  {
    path: 'accessibility',
    component: AccessibilityComponent,
    data: {
      title: 'Accessibility'
    }
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
    data: {
      title: 'Access Denied'
    }
  },
  {
    path: 'service-down',
    component: ServiceDownComponent,
    data: {
      title: 'Service Unavailable'
    }
  },
  {
    path: 'not-authorised',
    component: NotAuthorisedComponent,
    data: {
      title: 'Not Authorised'
    }
  },
  {
    path: 'signed-out',
    component: SignedOutComponent,
    data: {
      title: 'Signed Out'
    }
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
