import {Component, OnInit, Input} from '@angular/core';
import * as fromStore from '../../store';
import * as fromRoot from '../../../app/store';
import { Store, select } from '@ngrx/store';
import { OrganisationVM} from 'src/org-manager/models/organisation';
import { Observable } from 'rxjs';
import {map, takeWhile} from 'rxjs/operators';

/**
 * Bootstraps Organisation Details
 */
@Component({
  selector: 'app-org-details',
  templateUrl: './organisation-details.component.html'
})
export class OrganisationDetailsComponent implements OnInit {

  public orgSubscription$: Observable<OrganisationVM[]>;
  public dxNumber: string;
  public dxExchange: string;

  constructor(public store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
    this.orgSubscription$ = this.store.pipe(select(fromStore.selectedActiveOrganisation));
    this.orgSubscription$.pipe(takeWhile(org => !org), map(console.log)).subscribe(org => {

      if (!org) {
        this.store.dispatch(new fromRoot.Go({path: ['/active-organisation']}));
      }
    });
  }

}
