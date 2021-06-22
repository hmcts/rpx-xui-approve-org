import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromStore from '../../../org-manager/store';
import * as fromOrganisation from '../../store/';

@Component({
  selector: 'app-home-component',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  public readonly tabs = [
    { url: '/organisation/pending', label: 'New registrations' },
    { url: '/organisation/pbas', label: 'New PBAs' },
    { url: '/organisation/active', label: 'Active organisations' }
  ];
  public searchString: string = '';
  public activeRoute: string;
  private routeSubscription: Subscription;

  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.setupRoute();
    // Watch for changes to the route to set the appropriate tab.
    this.routeSubscription = this.router.events.subscribe({
      next: event => {
        if (event instanceof NavigationEnd) {
          this.setupRoute();
        }
      }
    });

    this.store.pipe(select(fromOrganisation.getSearchString)).subscribe(str => this.searchString = str);
  }

  public ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  public submitSearch(searchString: string): void {
    this.store.dispatch(new fromOrganisation.UpdateOrganisationsSearchString(searchString));
  }

  private setupRoute(): void {
    this.activeRoute = this.router.url.split('?')[0];
  }
}
