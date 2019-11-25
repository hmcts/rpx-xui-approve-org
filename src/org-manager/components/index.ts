import { NotificationBannerComponent } from './notification-banner/notification-banner.component';
import { BackLinkComponent } from './back-link/back-link.component';
import {OrganisationDetailsComponent} from '../containers/organisation-details/organisation-details.component';

export const components: any[] = [
  NotificationBannerComponent,
  BackLinkComponent,
  OrganisationDetailsComponent
];

export * from './notification-banner/notification-banner.component';
export * from './back-link/back-link.component';
export * from '../containers/organisation-details/organisation-details.component';
