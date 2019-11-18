import { NotificationBannerComponent } from './notification-banner/notification-banner.component';
import { SummaryComponent } from './summary/summary.component';
import { SummaryPendingComponent } from './summary-pending/summary-pending.component';
import { BackLinkComponent } from './back-link/back-link.component';
import {OrganisationDetailsComponent} from './organisation-details/organisation-details.component';

export const components: any[] = [
  NotificationBannerComponent,
  SummaryComponent,
  SummaryPendingComponent,
  BackLinkComponent,
  OrganisationDetailsComponent
];

export * from './notification-banner/notification-banner.component';
export * from '../components/summary/summary.component';
export * from './summary-pending/summary-pending.component';
export * from './back-link/back-link.component';
export * from './organisation-details/organisation-details.component';
