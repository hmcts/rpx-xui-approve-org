import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';

@Component({
    selector: 'app-reinvite-user-success',
    templateUrl: './reinvite-user-success.component.html'
})
export class ReinviteUserSuccessComponent implements OnInit {

    public email$: Observable<string>;
    public orgId: string;

    constructor(private readonly store: Store<fromStore.OrganisationRootState>) { }

    public ngOnInit() {
        this.email$ = this.store.pipe(select(fromStore.getInviteSuccessEmailSelector));
        this.store.pipe(select(fromStore.getOrganisationIdSelector)).subscribe( id => this.orgId = id );
    }

    public onGoBack() {
      this.store.dispatch(new fromRoot.Go({ path: ['/organisation-details', this.orgId] }));
    }
}
