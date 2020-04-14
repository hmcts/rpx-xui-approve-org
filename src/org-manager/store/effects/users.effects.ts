import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/services/logger.service';
import { UsersService } from 'src/org-manager/services';
import * as fromRoot from '../../../app/store';
import * as fromActions from '../actions';
import { ErrorReport } from 'src/org-manager/models/errorReport.model';
import { Action } from '@ngrx/store';

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
            const action = UsersEffects.getErrorAction(errorReport.error);
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

  @Effect()
  public failUser$ = this.actions$.pipe(
    ofType(fromActions.SUBMIT_REINVITE_USER_ERROR_CODE_400,
      fromActions.SUBMIT_REINVITE_USER_ERROR_CODE_404,
      fromActions.SUBMIT_REINVITE_USER_ERROR_CODE_500),
    map(() => {
      console.log('fail user effect1');
      return new fromRoot.Go({ path: ['/reinvite-user-error'] });
    })
  );

  // public failUser404$ = this.actions$.pipe(
  //   ofType(fromActions.SUBMIT_REINVITE_USER_ERROR_CODE_404),
  //   map(() => {
  //     console.log('fail user effect2');
  //     return new fromRoot.Go({ path: ['/reinvite-user-error'] });
  //   })
  // );


  public static getErrorAction(error: ErrorReport): Action {
    console.log('get error action');
    switch (error.apiStatusCode) {
      case 400:
      case 401:
      case 402:
      case 403:
      case 405:
        return new fromActions.SubmitReinviteUserErrorCode400(error);
      case 404:
        console.log('404');
        return new fromActions.SubmitReinviteUserErrorCode404(error);
      case 429:
        return new fromActions.SubmitReinviteUserErrorCode429(error);
      case 500:
        return new fromActions.SubmitReinviteUserErrorCode500(error);
      default:
          return new fromActions.SubmitReinviteUserError(error);
    }
  }
}
