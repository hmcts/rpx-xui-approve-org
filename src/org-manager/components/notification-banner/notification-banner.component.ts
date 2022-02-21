import {Component, Input } from '@angular/core';
import { NotificationBannerType } from '../../../models/notification-banner-type.enum';
@Component({
  selector: 'app-notification-banner-component',
  templateUrl: './notification-banner.component.html',
})

export class NotificationBannerComponent {
  constructor() {}
  @Input() bannerType: NotificationBannerType = NotificationBannerType.INFORMATION;
  public notificationBannerType = NotificationBannerType;
}
