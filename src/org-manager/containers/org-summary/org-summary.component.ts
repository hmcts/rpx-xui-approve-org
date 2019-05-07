import {Component, OnDestroy, OnInit} from '@angular/core';
import * as fromfeatureStore from '../../store';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/internal/operators';
import { IProduct } from '../../models/product'
import { OrganisationService } from '../../services/organisation.service'
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';

@Component({
  selector: 'app-org-summary',
  templateUrl: './org-summary.component.html',
  styleUrls: ['./org-summary.component.scss']
})
export class OrgSummaryComponent implements OnInit, OnDestroy {
  orgSummary$ = {}
  loading$: Observable<boolean>;
  orgSummary = {}
  errorMessage = '';
  
  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<fromfeatureStore.OrganisationState>,
    private organisationService: OrganisationService) { }

  ngOnInit() {
    console.log('the activated route path')
    this.activeRoute.url.subscribe(url => console.log(url[0].path));

    this.activeRoute.url.subscribe(url => {
      this.store.dispatch(new fromfeatureStore.LoadSingleOrg({ id: url[0].path
      }))
    })

    //OLD WAY
    /*this.activeRoute.parent.params.pipe(
      map(payload => {
        this.store.dispatch(new fromfeatureStore.LoadSingleOrg({id: payload.id }));
      })
    ).subscribe();*/

    this.orgSummary$ = this.store.pipe(select(fromfeatureStore.getSingleOrgOverview));
    this.loading$ = this.store.pipe(select(fromfeatureStore.orgSummaryLoading));

    this.activeRoute.url.subscribe(url => {
      console.log('url',url[0].path)
      this.organisationService.getSingleOrganisation(url[0].path).subscribe(
        orgSummary => {
          this.orgSummary = orgSummary[0];
          console.log('org summary',orgSummary[0])
        },
        error => this.errorMessage = <any>error
      );
    })

  }
  ngOnDestroy() {
    this.store.dispatch(new fromfeatureStore.ResetSingleOrg({}));
  }
}
