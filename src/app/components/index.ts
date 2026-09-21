import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { AccessibilityComponent } from './accessibility/accessibility.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { HmctsGlobalFooterComponent } from './hmcts-global-footer/hmcts-global-footer.component';
import { HmctsGlobalHeaderComponent } from './hmcts-global-header/hmcts-global-header.component';
import { NotAuthorisedComponent } from './not-authorised/not-authorised.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ServiceDownComponent } from './service-down/service-down.component';
import { SitemapComponent } from './sitemap/sitemap.component';
import { SignedOutComponent } from './signed-out/signed-out.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';

export const components: any[] = [
  HmctsGlobalHeaderComponent,
  HmctsGlobalFooterComponent,
  AccessDeniedComponent,
  ServiceDownComponent,
  NotAuthorisedComponent,
  CookiePolicyComponent,
  TermsAndConditionsComponent,
  PrivacyPolicyComponent,
  AccessibilityComponent,
  SitemapComponent,
  SignedOutComponent
];

export * from './hmcts-global-header/hmcts-global-header.component';
export * from './hmcts-global-footer/hmcts-global-footer.component';
export * from './access-denied/access-denied.component';
export * from './service-down/service-down.component';
export * from './not-authorised/not-authorised.component';
export * from './cookie-policy/cookie-policy.component';
export * from './terms-and-conditions/terms-and-conditions.component';
export * from './privacy-policy/privacy-policy.component';
export * from './accessibility/accessibility.component';
export * from './sitemap/sitemap.component';
export * from './signed-out/signed-out.component';
