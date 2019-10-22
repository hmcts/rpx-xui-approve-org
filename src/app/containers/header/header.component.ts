import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Navigations, NavItem, ServiceName } from 'src/shared/types';
import * as fromRoot from '../../store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public navItems: NavItem[];
  public navigations: Navigations;
  public serviceName: ServiceName;
  @Output() public navigate = new EventEmitter<string>();

  // RM: This seems to be never set, look into removing this here and in template
  public isUserLoggedIn$: Observable<boolean>;

  constructor(public store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.store.pipe(select(fromRoot.getRouterState)).subscribe(rootState => {
      if (rootState) {
        this._updateNavItems(rootState.state.url);
      }
    });

    this.navItems = [{
      text: 'Organisation',
      href: '/organisation',
      active: true
    }, {
      text: 'Users',
      href: '/users',
      active: false
    }, {
      text: 'Fee Accounts',
      href: '/fee-accounts',
      active: false
    }];

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
        href: '/api/logout',
        emit: 'sign-out'
      }]
    };
  }

  public onNavigate(event: string) {
    this.navigate.emit(event);
  }

  private _updateNavItems(url: string): void {
    this.navItems = this.navItems.map(item => {
      return {
        ...item,
        active: item['href'] === url
      };
    });
  }
}
