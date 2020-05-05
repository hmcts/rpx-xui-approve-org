import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

@Component({
  selector: 'app-back-link',
  templateUrl: './back-link.component.html'
})
export class BackLinkComponent {
  @Input() public store: Store<fromOrganisationPendingStore.OrganisationRootState>;

  constructor(private route: ActivatedRoute) { }

  public onGoBack() {
    this.route.url.subscribe(url => {
      if ( url[0].path === 'active-organisation') {
        this.store.dispatch(new fromRoot.Go({path: ['/pending-organisations']}));
      } else {
        this.store.dispatch(new fromRoot.Back());
      }
    });
  }
}
