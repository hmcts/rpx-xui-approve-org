import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

@Component({
  selector: 'app-back-link',
  templateUrl: './back-link.component.html'
})
export class BackLinkComponent implements OnInit, OnDestroy {
  @Input() public store: Store<fromOrganisationPendingStore.OrganisationRootState>;

  constructor(private readonly route: ActivatedRoute) {}

  private subscription: Subscription;
  public currentUrl: string;

  public ngOnInit(): void {
    this.subscription = this.route.url.subscribe((url) => {
      this.currentUrl = url[0].path;
    });
  }

  public onGoBack() {
    if (this.currentUrl === 'active-organisation') {
      this.store.dispatch(new fromRoot.Go({ path: ['/pending-organisations'] }));
    } else {
      this.store.dispatch(new fromRoot.Back());
    }
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
