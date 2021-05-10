import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-organisations-home-component',
  templateUrl: './organisations-home.component.html',
})
export class OrganisationsHomeComponent implements OnInit, OnDestroy {
  public readonly tabs = [
    { url: '/organisation/pending', label: 'New registrations' },
    { url: '/organisation/pbas', label: 'New PBAs' },
    { url: '/organisation/active', label: 'Active organisations' }
  ];
  public activeRoute: string;
  private routeSubscription: Subscription;

  constructor(private readonly router: Router) {}

  public ngOnInit(): void {
    this.setupRoute();
    // Watch for changes to the route to set the appropriate tab.
    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setupRoute();
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private setupRoute(): void {
    this.activeRoute = this.router.url.split('?')[0];
  }
}
