import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/services/logger.service';
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
  public reinviteUser$ = this.actions$.pipe(
    ofType(fromActions.REINVITE_PENDING_USER),
    map(() => {
      console.log('coming to effect');
      return new fromRoot.Go({ path: ['/reinvite-user'] });
    })
  );

  @Effect()
  public submitReinviteUser$ = this.actions$.pipe(
    ofType(fromActions.SUBMIT_REINVITE_USER),
    map((action: fromActions.SubmitReinviteUser) => action.payload),
    switchMap((payload) => {
      console.log('payload submit');
      console.log(payload);
      return this.usersService.inviteUser(payload.organisationId, payload.form).pipe(
          map(response => new fromActions.SubmitReinviteUserSucces(response)),
          tap(() => this.loggerService.info('User Reinvited')),
          catchError(error => {
            this.loggerService.error(error.message);
            return of(new fromActions.SubmitReinviteUserError(error));
          }));
      })
  );

  @Effect()
  public confirmUser$ = this.actions$.pipe(
    ofType(fromActions.SUBMIT_REINVITE_USER_SUCCESS),
    map(() => {
      return new fromRoot.Go({ path: ['/reinvite-user-success'] });
    })
  );
}
