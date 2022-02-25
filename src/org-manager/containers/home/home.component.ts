import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { OrganisationService } from '../../services';
import { LoadingService } from '@hmcts/rpx-xui-common-lib';
import { delay, map } from 'rxjs/operators';
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
  public showSpinner$: Observable<boolean>;
  public searchString: string = '';
  public activeRoute: string;
  public notificationBanners: [];
  private routeSubscription: Subscription;
  constructor(
    private readonly router: Router,
    protected organisationService: OrganisationService,
    private readonly loadingService: LoadingService,
  ) { }

  public ngOnInit(): void {
    this.setupRouteState();
    // Watch for changes to the route to set the appropriate tab.
    this.routeSubscription = this.router.events.subscribe({
      next: event => {
        if (event instanceof NavigationEnd) {
          this.setupRouteState();
        }
      }
    });

    const libServices$ = combineLatest([
      this.loadingService.isLoading
    ]);

    this.showSpinner$ = libServices$.pipe(delay(0), map(states => states.reduce((c, s) => c || s, false)));
  }

  public ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  public submitSearch(searchString: string): void {
    this.organisationService.setOrganisationSearchString(searchString);
  }

  private setupRouteState(): void {
    this.activeRoute = this.router.url.split('?')[0];
    if (window.history.state && window.history.state.notificationBanners) {
      this.notificationBanners = window.history.state.notificationBanners;
    }
  }
}
