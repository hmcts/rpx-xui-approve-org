import { Component, Input, OnInit } from '@angular/core';
import { FeatureToggleService } from '@hmcts/rpx-xui-common-lib';
import { Observable, of } from 'rxjs';
import { NavItem } from '../../store';

@Component({
    selector: 'app-hmcts-primary-navigation',
    templateUrl: './hmcts-primary-navigation.component.html',
    styleUrls: ['./hmcts-primary-navigation.component.scss']
})
export class HmctsPrimaryNavigationComponent implements OnInit {

    @Input() set userLoggedIn(value) {
        this.isUserLoggedIn = value;
    }

    @Input() label: string;
    @Input() items: object[];
    @Input() isBrandedHeader: boolean;

    isUserLoggedIn: boolean;
    constructor(private featureToggleService: FeatureToggleService) {
    }

    ngOnInit(): void {
      console.log('items', this.items);
    }

    public isFeatureNavEnabled$(navItem: NavItem): Observable<boolean> {
        console.log('navItem', navItem);
        console.log('isfeatureToggleable', navItem.feature.isfeatureToggleable);

        return navItem.feature.isfeatureToggleable ? this.featureToggleService.isEnabled(navItem.feature.featureName) : of(true);
    }
}
