import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { NeverObservable } from 'rxjs-compat/observable/NeverObservable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UserInterface } from '../../../models/user.model';
import { LogOutKeepAliveService } from '../../services/keep-alive/keep-alive.service';
import { UserService } from '../../services/user-service/user.service';
import { Action } from '../../utils/app-utils';
import * as appActions from '../actions';
import { GetUserDetailsFailure, GetUserDetailsSuccess, Go } from '../actions';
import * as routerAction from '../actions/router.action';

@Injectable()
export class AppEffects {
  @Effect({ dispatch: false })
  public logout$: NeverObservable<void> = this.actions$.pipe(
    ofType(appActions.LOGOUT),
    tap(() => {
      window.location.href = '/auth/logout';
    }),
  );

  @Effect()
  public signOut$: Observable<Action<void>> = this.actions$.pipe(
    ofType(appActions.SIGNED_OUT),
    switchMap(() =>
      this.logOutService
        .logOut()
        .pipe(map(() => new appActions.SignedOutSuccess())),
    ),
  );

  @Effect()
  public signedOutSuccess$: Observable<Go> = this.actions$.pipe(
    ofType(appActions.SIGNED_OUT_SUCCESS),
    map(() => new appActions.Go({ path: ['/signed-out'] })),
  );

  @Effect({ dispatch: false })
  public keepAlive$: NeverObservable<void> = this.actions$.pipe(
    ofType(appActions.KEEP_ALIVE),
    switchMap(() => this.logOutService.heartBeat()),
  );

  @Effect()
  public getUser$: Observable<
    GetUserDetailsFailure | GetUserDetailsSuccess
  > = this.actions$.pipe(
    ofType(appActions.GET_USER_DETAILS),
    switchMap(() =>
      this.userService.getUserDetails().pipe(
        map(
          (userDetails: UserInterface) =>
            new appActions.GetUserDetailsSuccess(userDetails),
        ),
        catchError((error: HttpErrorResponse) =>
          of(new appActions.GetUserDetailsFailure(error)),
        ),
      ),
    ),
  );

  @Effect()
  public addGlobalErrorEffect$: Observable<Go> = this.actions$.pipe(
    ofType(appActions.APP_ADD_GLOBAL_ERROR),
    map(() => new routerAction.Go({ path: ['/service-down'] })),
  );

  public constructor(
    private readonly actions$: Actions,
    private readonly logOutService: LogOutKeepAliveService,
    private readonly userService: UserService,
  ) {}
}
