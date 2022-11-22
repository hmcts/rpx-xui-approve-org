import {Component} from '@angular/core';
import { Router } from '@angular/router';
import {Store} from '@ngrx/store';
import {Go} from '../../../app/store/actions';
import {OrganisationVM} from '../../../org-manager/models/organisation';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import {DeleteOrganisation, DeletePendingOrganisation} from '../../store/actions/organisations.actions';

@Component({
  selector: 'app-org-pending-delete',
  templateUrl: './delete-organisation.component.html'
})
export class DeleteOrganisationComponent {

  public orgForReview: OrganisationVM | null;

  public confirmButtonDisabled = false;

  constructor(public store: Store<fromOrganisationPendingStore.OrganisationRootState>, private readonly router: Router) {
    const org = this.router.getCurrentNavigation();
    if (!org || !org.extras || !org.extras.state) {
      this.store.dispatch(new Go({ path: ['/pending-organisations'] }));
    }

    if (org && org.extras && org.extras.state.data) {
      this.orgForReview = org.extras.state.data as OrganisationVM;
    }
  }

  public onDeleteOrganisationHandler(orgForReview: OrganisationVM) {
    if (orgForReview.status === 'PENDING') {
      this.store.dispatch(new DeletePendingOrganisation(orgForReview));
    } else {
      this.store.dispatch(new DeleteOrganisation(orgForReview));
    }
    // TODO: What should happen if the organisation status is neither "PENDING" nor "ACTIVE"? Is that even possible?
  }
}
