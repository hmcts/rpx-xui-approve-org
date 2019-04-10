import {Component, OnDestroy, OnInit} from '@angular/core';
import * as fromfeatureStore from '../../store';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/internal/operators';

@Component({
  selector: 'app-org-summary',
  templateUrl: './org-summary.component.html',
  styleUrls: ['./org-summary.component.scss']
})
export class OrgSummaryComponent implements OnInit, OnDestroy {
  accountSummary$: Observable<any>;
  loading$: Observable<boolean>;
  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<fromfeatureStore.OrganisationState>) { }

  ngOnInit() {
    //TODO move to a guard
    this.activeRoute.parent.params.pipe(
      map(payload => {
        this.store.dispatch(new fromfeatureStore.LoadSingleOrg({id: payload.id }));
      })
    ).subscribe();
    this.accountSummary$ = this.store.pipe(select(fromfeatureStore.getSingleAccounOverview));
    this.loading$ = this.store.pipe(select(fromfeatureStore.orgSummaryLoading));
  }
  ngOnDestroy() {
    this.store.dispatch(new fromfeatureStore.ResetSingleOrg({}));
  }
}
