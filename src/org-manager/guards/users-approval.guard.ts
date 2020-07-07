import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { AppConstants } from 'src/app/app.constants';
import { environment } from 'src/environments/environment';
import * as fromRoot from '../../app/store';
import * as fromStore from '../store';


@Injectable({
  providedIn: 'root'
})
export class UserApprovalGuard implements CanActivate {
    constructor(
        private readonly cookieService: CookieService,
        private readonly store: Store<fromStore.OrganisationRootState>
    ) {
    }

    public canActivate() {
      const isUserApproval = this.isUserApprovalRole();
      if (!isUserApproval) {
        this.redirectToPendingOrgs();
      }
      return isUserApproval;
    }

    public isUserApprovalRole(): boolean {
      const userRoles = this.cookieService.get(environment.cookies.roles);
      if (userRoles && userRoles.indexOf(AppConstants.XUI_APPROVAL_ROLE) !== -1) {
        return true;
      }
      return false;
    }

    public redirectToPendingOrgs() {
        this.store.dispatch(new fromRoot.Go({ path: ['/pending-organisations'] }));
    }
}

