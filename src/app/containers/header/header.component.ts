import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromRoot from '../../store';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    logoutLink: string;
    navItems: Array<{}>;
    navigations;
    serviceName;
    @Output() navigate = new EventEmitter<string>();

    isUserLoggedIn$: Observable<boolean>;

    constructor(public store: Store<fromRoot.State>) {}


    ngOnInit(): void {
        this.store.pipe(select(fromRoot.getRouterState)).subscribe(rootState => {
          if (rootState) {
            this.updateNavItems(rootState.state.url);
          }
        });

        this.logoutLink = `/api/logout`;

        this.navItems = [{
            text: 'Organisation',
            href: '/organisation',
            active: true
        },
        {
            text: 'Users',
            href: '/users',
            active: false
        },
        {
            text: 'Fee Accounts',
            href: '/fee-accounts',
            active: false
        },

        ];
        this.serviceName = {
            name: 'Approve organisations',
            url: '/'
        };
        this.navigations = {
            label: 'Account navigation',
            items: [{
                text: 'Profile',
                href: '/profile'
            }, {
                text: 'Sign out',
                href: 'api/logout',
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
