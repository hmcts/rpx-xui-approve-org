import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ReinviteError } from 'src/org-manager/models/reinvite-error.model';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';

@Component({
    selector: 'app-reinvite-user-error',
    templateUrl: './reinvite-user-error.component.html'
})
export class ReinviteUserErrorComponent implements OnInit {

    public header$: Observable<string>;
    public reinviteError$: Observable<ReinviteError>;
    public orgId: string;


    constructor(private readonly store: Store<fromStore.OrganisationRootState>) { }

    public ngOnInit() {
        this.header$ = this.store.pipe(select(fromStore.getInviteUserErrorHeaderSelector));
        this.reinviteError$ = this.store.pipe(select(fromStore.getInviteErrorSelector));
        this.store.pipe(select(fromStore.getOrganisationIdSelector)).subscribe( id => this.orgId = id );

    }

    public onGoBack() {
      this.store.dispatch(new fromRoot.Back());
    }

    public gotToManageUser() {
      this.store.dispatch(new fromRoot.Go({ path: ['/organisation-details', this.orgId] }));
    }
}
