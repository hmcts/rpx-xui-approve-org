import { OnInit } from '@angular/core';
import { Action, MemoizedSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { FilterOrganisationsPipe } from 'src/org-manager/pipes';

import { OrganisationVM } from '../../models/organisation';
import * as fromStore from '../../store';

export abstract class OrganisationListComponent implements OnInit {
  private readonly filter: FilterOrganisationsPipe = new FilterOrganisationsPipe();

  public loaded$: Observable<boolean>;
  public searchString: string = '';
  public filteredOrgs: OrganisationVM[];
  public filteredOrgsCount: number;
  public orgsCount: number;

  private orgs: OrganisationVM[];

  public abstract get loadedSelector(): MemoizedSelector<object, boolean>;
  public abstract get loadAction(): Action;
  public abstract get organisationsSelector(): MemoizedSelector<object, OrganisationVM[]>;

  constructor(protected readonly store: Store<fromStore.OrganisationRootState>) {}

  public ngOnInit(): void {
    this.loaded$ = this.store.pipe(select(this.loadedSelector));
    this.loaded$.pipe(takeWhile(loaded => !loaded)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(this.loadAction);
      }
    });
    this.store.pipe(select(this.organisationsSelector)).subscribe(orgs => {
      this.orgs = orgs;
      this.doFiltering();
    });
    this.store.dispatch(new fromStore.ClearErrors());
    this.store.pipe(select(fromStore.getSearchString)).subscribe(str => {
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
    this.orgsCount = (this.orgs || []).length;
  }
}
