import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Go } from 'src/app/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import * as fromStore from '../../store/';

@Component({
  selector: 'app-org-pending-approve',
  templateUrl: './approve-organisation.component.html'
})
export class ApproveOrganisationComponent implements OnInit {
  public orgForReview: OrganisationVM | null;
  public serverResponseMessages$: Observable<any>;
  public disabled = true;

  constructor(
      private readonly router: Router,
      public store: Store<fromOrganisationPendingStore.OrganisationRootState>
  ) {
    const org = this.router.getCurrentNavigation();
    if (!org || !org.extras || !org.extras.state) {
      this.store.dispatch(new Go({ path: ['/pending-organisations'] }));
    }

    if (org && org.extras && org.extras.state.data) {
      this.orgForReview = org.extras.state.data as OrganisationVM;
    }
  }

  public ngOnInit() {
    this.serverResponseMessages$ = this.store.pipe(select(fromStore.getErrorMessage), tap((message) => {
      if (message) {
        this.disabled = true;
      }
    }));
  }

  public onApproveOrganisations() {
    this.store.dispatch(new fromOrganisationPendingStore.ApprovePendingOrganisations(this.orgForReview));
    this.disabled = false;
  }
}
