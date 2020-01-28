import {Component, OnInit} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {takeWhile, tap} from 'rxjs/operators';
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

  constructor(private readonly store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
   this.store.pipe(select(fromStore.getAllLoaded)).pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadActiveOrganisation());
        this.store.dispatch(new fromOrganisation.LoadPendingOrganisations());
      }
    });

   this.orgs$ = this.store.pipe(select(fromStore.getActiveAndPending));
  }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }

}
