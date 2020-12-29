import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FeatureToggleService } from '@hmcts/rpx-xui-common-lib';
import { Store, select } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { Observable, of } from 'rxjs';
import { AppConstants } from 'src/app/app.constants';
import { AppUtils } from 'src/app/utils/app-utils';
import * as fromRoot from '../../store';
import { NavItem } from '../../store';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    navItems: Array<{}>;
    navigations;
    serviceName;
    @Output() navigate = new EventEmitter<string>();

    isUserLoggedIn$: Observable<boolean>;

    constructor(public readonly store: Store<fromRoot.State>,
      private readonly cookieService: CookieService,
      private readonly featureToggleService: FeatureToggleService) {}

    ngOnInit(): void {
        this.store.pipe(select(fromRoot.getRouterState)).subscribe(rootState => {
          if (rootState) {
            this.updateNavItems(rootState.state.url);
          }
        });

        const encodedRoles = this.cookieService.getObject('roles');
        if(encodedRoles) {
          const userRoles = AppUtils.getRoles(encodedRoles);
          const navItems = AppUtils.getNavItemsBasedOnRole(AppConstants.ROLES_BASED_NAV, userRoles);
          this.navItems = navItems.filter(navItem => this.applyFeatureToggleFilter(navItem));
        }

        this.serviceName = {
            name: 'Approve organisation',
            url: '/'
        };
        this.navigations = {
            label: 'Account navigation',
            items: [{
                text: 'Profile',
                href: '/profile'
            }, {
                text: 'Sign out',
                href: '/auth/logout',
                emit: 'sign-out'
            }]
        };

    }

  public applyFeatureToggleFilter(navItem: NavItem): Observable<boolean> {
    return navItem.feature.isfeatureToggleable ? this.featureToggleService.isEnabled(navItem.feature.featureName) : of(true);
  }

  updateNavItems(url): void {
    this.navItems = this.navItems.map(item => {
      return {
        ...item,
        active: item['href'] === url
      };
    });
  }

  onNavigate(event) {
    this.navigate.emit(event);
  }
}
