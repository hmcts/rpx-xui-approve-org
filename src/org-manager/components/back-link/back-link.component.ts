import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromRoot from '../../../app/store';

@Component({
  selector: 'app-back-link',
  templateUrl: './back-link.component.html'
})
export class BackLinkComponent {
  @Input() public store: Store<fromOrganisationPendingStore.OrganisationRootState>;

  constructor() { }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }

}
