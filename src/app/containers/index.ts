import { HmctsPrimaryNavigationComponent } from './hmcts-primary-navigation/hmcts-primary-navigation.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { RedirectComponent } from './redirect/redirect.component';

export const containers: any[] = [
  HeaderComponent,
  FooterComponent,
  HmctsPrimaryNavigationComponent,
  RedirectComponent
];

export * from './footer/footer.component';
export * from './header/header.component';
export * from './hmcts-primary-navigation/hmcts-primary-navigation.component';
export * from './redirect/redirect.component';
