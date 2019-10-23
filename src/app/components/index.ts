// tslint:disable-next-line: max-line-length
import { HmctsPrimaryNavigationComponent } from '../../../projects/gov-ui/src/lib/components/hmcts-primary-navigation/hmcts-primary-navigation.component';
import { AccessibilityComponent } from './accessibility/accessibility.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { HmctsGlobalFooterComponent } from './hmcts-global-footer/hmcts-global-footer.component';
import { HmctsGlobalHeaderComponent } from './hmcts-global-header/hmcts-global-header.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ServiceDownComponent } from './service-down/service-down.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';

export const components: any[] = [
  HmctsGlobalHeaderComponent,
  HmctsGlobalFooterComponent,
  HmctsPrimaryNavigationComponent,
  ServiceDownComponent,
  CookiePolicyComponent,
  TermsAndConditionsComponent,
  PrivacyPolicyComponent,
  AccessibilityComponent
];

export * from '../../../projects/gov-ui/src/lib/components/gov-uk-main-wrapper/gov-uk-main-wrapper.component';
export * from '../../../projects/gov-ui/src/lib/components/hmcts-primary-navigation/hmcts-primary-navigation.component';
export * from './accessibility/accessibility.component';
export * from './cookie-policy/cookie-policy.component';
export * from './hmcts-global-footer/hmcts-global-footer.component';
export * from './hmcts-global-header/hmcts-global-header.component';
export * from './privacy-policy/privacy-policy.component';
export * from './service-down/service-down.component';
export * from './terms-and-conditions/terms-and-conditions.component';

