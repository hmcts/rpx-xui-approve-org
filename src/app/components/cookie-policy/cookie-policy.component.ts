import { Component } from '@angular/core';
import { AppConstants } from '../../../app/app.constants';

@Component({
  selector: 'app-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  standalone: false
})
export class CookiePolicyComponent {
  public readonly newTabAnnouncement = AppConstants.NEW_TAB_ANNOUNCEMENT;
}
