import { Component, Input } from '@angular/core';
import { FeatureToggleService } from '@hmcts/rpx-xui-common-lib';
import { Observable, of } from 'rxjs';
import { NavItem } from '../../store';

@Component({
  selector: 'app-hmcts-primary-navigation',
  templateUrl: './hmcts-primary-navigation.component.html',
  styleUrls: ['./hmcts-primary-navigation.component.scss']
})
export class HmctsPrimaryNavigationComponent {
  @Input() public set userLoggedIn(value) {
    this.isUserLoggedIn = value;
  }

  @Input() public label: string;
  @Input() public items: object[];
  @Input() public isBrandedHeader: boolean;

  public isUserLoggedIn: boolean;

  constructor(private readonly featureToggleService: FeatureToggleService) {}

  public isFeatureNavEnabled$(navItem: NavItem): Observable<boolean> {
    return navItem.feature.isfeatureToggleable ? this.featureToggleService.isEnabled(navItem.feature.featureName) : of(true);
  }
}
