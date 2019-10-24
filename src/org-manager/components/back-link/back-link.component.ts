import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

@Component({
  selector: 'app-back-link',
  templateUrl: './back-link.component.html'
})
export class BackLinkComponent {
  @Input() public store: Store<fromOrganisationPendingStore.OrganisationState>;

  constructor() { }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }

}
