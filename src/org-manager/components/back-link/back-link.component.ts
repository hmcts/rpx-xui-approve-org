import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-back-link',
  templateUrl: './back-link.component.html'
})

export class BackLinkComponent implements OnInit, OnDestroy {
  @Input() public store: Store<fromOrganisationPendingStore.OrganisationRootState>;

  constructor(private route: ActivatedRoute) { }

  private subscription: Subscription;
  public currentUrl: string;

  public ngOnInit(): void {
    this.subscription = this.route.url.subscribe(url => {
      this.currentUrl = url[0].path;
    });
  }

  public onGoBack() {
      if ( this.currentUrl === 'active-organisation') {
        this.store.dispatch(new fromRoot.Go({path: ['/pending-organisations']}));
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
