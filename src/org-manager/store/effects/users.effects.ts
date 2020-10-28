import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/services/logger.service';
import { AppUtils } from 'src/app/utils/app-utils';
import { ErrorReport } from 'src/org-manager/models/errorReport.model';
import { UsersService } from 'src/org-manager/services';
import * as fromRoot from '../../../app/store';
import * as fromActions from '../actions';

@Injectable()
export class UsersEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly usersService: UsersService,
    private readonly loggerService: LoggerService
  ) { }

  @Effect()
  public showUserDetails$ = this.actions$.pipe(
    ofType(fromActions.SHOW_USER_DETAILS),
    map(() => {
      return new fromRoot.Go({ path: ['/user-details'] });
    })
  );

  @Effect()
  public reinviteUser$ = this.actions$.pipe(
    ofType(fromActions.REINVITE_PENDING_USER),
    map(() => {
      return new fromRoot.Go({ path: ['/reinvite-user'] });
    })
  );

  @Effect()
  public submitReinviteUser$ = this.actions$.pipe(
    ofType(fromActions.SUBMIT_REINVITE_USER),
    map((action: fromActions.SubmitReinviteUser) => action.payload),
    switchMap((payload) => {
      console.log('form=> ');
      console.log(payload.form);
      return this.usersService.inviteUser(payload.organisationId, payload.form).pipe(
          map(response => new fromActions.SubmitReinviteUserSucces({...response, successEmail: payload.form.email})),
          tap(() => this.loggerService.info('User Reinvited')),
          catchError(errorReport => {
            this.loggerService.error(errorReport.message);
            const action = UsersEffects.getErrorAction(errorReport.error, payload.organisationId);
            return of(action);
          })
          );
      })
  );

  @Effect()
  public confirmUser$ = this.actions$.pipe(
    ofType(fromActions.SUBMIT_REINVITE_USER_SUCCESS),
    map(() => {
      return new fromRoot.Go({ path: ['/reinvite-user-success'] });
    })
  );

  public static getErrorAction(error: ErrorReport, orgId: string): Action {
    switch (error.apiStatusCode) {
      case 400:
      case 401:
      case 402:
      case 403:
      case 405:
        return new fromRoot.AddGlobalError(AppUtils.get400Error(orgId));
      case 404:
        return new fromRoot.AddGlobalError(AppUtils.get404Error(orgId));
      case 429:
        return new fromActions.SubmitReinviteUserErrorCode429(error);
      case 500:
        return new fromRoot.AddGlobalError(AppUtils.get500Error(orgId));
      default:
          return new fromActions.SubmitReinviteUserError(error);
    }
  }
}
