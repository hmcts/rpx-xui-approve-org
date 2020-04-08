import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@hmcts/rpx-xui-common-lib';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
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

    constructor(private readonly store: Store<fromStore.OrganisationRootState>) { }

    public ngOnInit() {
      this.errorsArray$ = this.store.pipe(select(fromStore.getGetInviteUserErrorsArray));

      this.user$ = this.store.pipe(select(fromStore.getSelectedUserSelector));

      this.store.pipe(select(fromStore.getIsSuperUserSelector)).subscribe(value => this.isSuperUser = value);
      this.store.pipe(select(fromStore.getOrganisationIdSelector)).subscribe(value => this.orgId = value);
    }

    public getTitle(user: User) {
      if (user && user.status === 'Active') { //TODO Change to Pending
        if (this.isSuperUser) {
          return 'Pending administrator details';
        }
        return 'Pending user details';
      }
      return 'User';
    }


  public reinviteUser(user: User) {
    if (this.isSuperUser) {
      const formValue = {
        firstName: user.firstName,
        lastName:  user.lastName,
        email: user.email,
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
