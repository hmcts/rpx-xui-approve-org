import {OrganisationDetailsComponent} from '../containers/organisation-details/organisation-details.component';
import { BackLinkComponent } from './back-link/back-link.component';
import { NotificationBannerComponent } from './notification-banner/notification-banner.component';
import { OrganisationDetailsInfoComponent } from './organisation-details-info/organisation-details-info.component';

export const components: any[] = [
  NotificationBannerComponent,
  BackLinkComponent,
  OrganisationDetailsComponent,
  OrganisationDetailsInfoComponent,
];

export * from './notification-banner/notification-banner.component';
export * from './back-link/back-link.component';
export * from '../containers/organisation-details/organisation-details.component';
export * from './organisation-details-info/organisation-details-info.component';
