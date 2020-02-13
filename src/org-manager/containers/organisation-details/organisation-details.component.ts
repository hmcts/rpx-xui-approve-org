import {Component, OnInit} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {filter, take, takeWhile} from 'rxjs/operators';
import { OrganisationVM} from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';
import * as fromOrganisation from '../../store/';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-details',
  templateUrl: './organisation-details.component.html'
})
export class OrganisationDetailsComponent implements OnInit {

  public orgs$: Observable<OrganisationVM>;

  constructor(
    private readonly store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
    this.store.pipe(select(fromStore.getAllLoaded)).pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadActiveOrganisation());
        this.store.dispatch(new fromOrganisation.LoadPendingOrganisations());
      }
    });

    this.orgs$ = this.store.pipe(select(fromStore.getActiveAndPending));
    this.orgs$.pipe(
        filter(value => value !== undefined),
        take(1)
    ).subscribe(({organisationId, pbaNumber, isAccLoaded}) => {
      if (!isAccLoaded && pbaNumber.length) {
        this.store.dispatch(new fromOrganisation.LoadPbaAccountsDetails({
              orgId: organisationId,
              pbas: pbaNumber.toString()
            }
          )
        );
      }
    });
  }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }

  public approveOrganisation(data: OrganisationVM) {
    console.log('parent approve org');
    if (data) {
      console.log(data);
      this.store.dispatch(new fromStore.AddReviewOrganisations(data));
    }
  }

}

