import {Component, OnDestroy, OnInit} from '@angular/core';
import * as fromfeatureStore from '../../store';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-org-summary',
  templateUrl: './org-summary.component.html',
  styleUrls: ['./org-summary.component.scss']
})
export class OrgSummaryComponent implements OnInit, OnDestroy {
  orgSummary$: Observable<any>;
  loading$: Observable<boolean>;
  orgSummary = {}
  errorMessage = '';
  
  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<fromfeatureStore.OrganisationState>) { }

  ngOnInit() {

    this.activeRoute.url.subscribe(url => {
      this.store.dispatch(new fromfeatureStore.LoadSingleOrg({ id: url[0].path
      }))
    })

    this.orgSummary$ = this.store.pipe(select(fromfeatureStore.getSingleOrgOverview));
    this.loading$ = this.store.pipe(select(fromfeatureStore.orgSummaryLoading));

  }
  ngOnDestroy() {
    this.store.dispatch(new fromfeatureStore.ResetSingleOrg({}));
  }
}
