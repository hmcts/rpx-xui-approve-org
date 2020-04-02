import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@hmcts/rpx-xui-common-lib';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromStore from '../../store';

@Component({
    selector: 'app-reinvite-user-success',
    templateUrl: './reinvite-user-success.component.html'
})
export class ReinviteUserSuccessComponent implements OnInit {

    public user$: Observable<User>;

    constructor(private readonly store: Store<fromStore.OrganisationRootState>) { }

    public ngOnInit() {
        this.user$ = this.store.pipe(select(fromStore.getPendingUserSelector));
    }

    // ngOnDestroy(): void {
    //     // this.store.dispatch(new fromStore.Reset());
    // }
}
