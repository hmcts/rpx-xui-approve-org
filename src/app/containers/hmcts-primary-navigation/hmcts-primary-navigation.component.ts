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

    @Input() set userLoggedIn(value) {
        this.isUserLoggedIn = value;
    }

    @Input() label: string;
    @Input() items: object[];
    @Input() isBrandedHeader: boolean;

    isUserLoggedIn: boolean;
    constructor(private featureToggleService: FeatureToggleService) {
    }

    public isFeatureNavEnabled$(navItem: NavItem): Observable<boolean> {
        return navItem.feature.isfeatureToggleable ? this.featureToggleService.isEnabled(navItem.feature.featureName) : of(true);
    }
}
