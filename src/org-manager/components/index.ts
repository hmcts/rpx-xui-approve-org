import { BackLinkComponent } from './back-link/back-link.component';
import { NotificationBannerComponent } from './notification-banner/notification-banner.component';
import { SummaryPendingComponent } from './summary-pending/summary-pending.component';
import { SummaryComponent } from './summary/summary.component';

export const components: any[] = [
  NotificationBannerComponent,
  SummaryComponent,
  SummaryPendingComponent,
  BackLinkComponent
];

export * from '../components/summary/summary.component';
export * from './back-link/back-link.component';
export * from './notification-banner/notification-banner.component';
export * from './summary-pending/summary-pending.component';
