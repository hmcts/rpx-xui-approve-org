import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { FilterOrganisationsPipe } from 'src/org-manager/pipes';

import * as fromStore from '../../../org-manager/store';
import { OrganisationVM } from '../../models/organisation';
import * as fromOrganisation from '../../store/';

@Component({
  selector: 'app-pending-overview-component',
  templateUrl: './pending-organisations.component.html',
})

export class PendingOrganisationsComponent implements OnInit {
  public loaded$: Observable<boolean>;
  public searchString: string = '';
  public filteredOrgs: OrganisationVM[];
  public filteredOrgsCount: number;

  private readonly filter: FilterOrganisationsPipe = new FilterOrganisationsPipe();
  private orgs: OrganisationVM[];

  constructor(private readonly store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
    this.loaded$ = this.store.pipe(select(fromOrganisation.getPendingLoaded));
    this.loaded$.pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(new fromOrganisation.LoadPendingOrganisations());
      }
    });
    this.store.pipe(select(fromStore.getPendingOrganisationsArray)).subscribe(orgs => {
      this.orgs = orgs;
      this.doFiltering();
    });
    // this.columnConfig = PendingOverviewColumnConfig;
    this.store.dispatch(new fromStore.ClearErrors());
    this.store.pipe(select(fromOrganisation.getSearchString)).subscribe(str => {
      this.searchString = str;
      this.doFiltering();
    });
  }

  private doFiltering(): void {
    if (this.orgs && this.searchString) {
      this.filteredOrgs = this.filter.transform(this.orgs, this.searchString);
    } else {
      this.filteredOrgs = this.orgs;
    }
    this.filteredOrgsCount = (this.filteredOrgs || []).length;
  }
}
