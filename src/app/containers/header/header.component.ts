import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import { AppUtils } from 'src/app/utils/app-utils';
import * as fromRoot from '../../store';

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

    constructor(public store: Store<fromRoot.State>,
      private readonly cookieService: CookieService) {}


    ngOnInit(): void {
        this.store.pipe(select(fromRoot.getRouterState)).subscribe(rootState => {
          if (rootState) {
            this.updateNavItems(rootState.state.url);
          }
        });

        const encodedRoles = this.cookieService.getObject('roles');
        if(encodedRoles) {
          const userRoles = AppUtils.getRoles(encodedRoles);
          this.navItems = AppUtils.getNavItemsBasedOnRole(userRoles, ['prd-admin']);
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
