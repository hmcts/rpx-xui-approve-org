import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@hmcts/rpx-xui-common-lib';
import { ofType, Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import {Observable, pipe} from 'rxjs';
import { AppConstants } from 'src/app/app.constants';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';

@Component({
    selector: 'app-user-details',
    templateUrl: './user-details.component.html'
})
export class UserDetailsComponent implements OnInit {
    public errorsArray$: Observable<{ isFromValid: boolean; items: { id: string; message: any; } []}>;

    public user$: Observable<User>;
    public isSuperUser: boolean;
    public orgId: string;

    public showWarningMessage: boolean;

    constructor(private readonly store: Store<fromStore.OrganisationRootState>,
                private readonly actions$: Actions) { }

    public ngOnInit() {
      this.errorsArray$ = this.store.pipe(select(fromStore.getGetInviteUserErrorsArray));

      this.user$ = this.store.pipe(select(fromStore.getSelectedUserSelector));

      this.store.pipe(select(fromStore.getIsSuperUserSelector)).subscribe(value => this.isSuperUser = value);
      this.store.pipe(select(fromStore.getOrganisationIdSelector)).subscribe(value => this.orgId = value);

      this.actions$.pipe(ofType(fromStore.SUBMIT_REINVITE_USER_ERROR_CODE_429)).subscribe(() => {
        this.showWarningMessage = true;
      });
    }

    public getTitle(user: User) {
      if (user && user.status === 'Pending') {
        if (this.isSuperUser) {
          return 'Pending administrator details';
        }
        return 'Pending user details';
      }
      return 'User';
    }


  public reinviteUser(user: User) {
    this.showWarningMessage = false;
    if (this.isSuperUser) {
      const formValue = {
        firstName: user.firstName,
        lastName:  user.lastName,
        email: user.email,
        resendInvite: true,
        roles: [ ...AppConstants.SUPER_USER_ROLES]
      };
      this.store.dispatch(new fromStore.SubmitReinviteUser({organisationId: this.orgId, form: formValue}));
    } else {
      this.store.dispatch(new fromStore.ReinvitePendingUser());
    }
  }

  public onGoBack() {
    this.store.dispatch(new fromRoot.Back());
  }
}
