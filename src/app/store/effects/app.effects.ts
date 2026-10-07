import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserInterface } from '../../../models/user.model';
import { SessionStorageService } from '../../../shared/services/session-storage.service';
import { LogOutKeepAliveService } from '../../services/keep-alive/keep-alive.service';
import { UserService } from '../../services/user-service/user.service';
import * as routerAction from '../../store/actions/router.action';
import * as appActions from '../actions';

@Injectable()
export class AppEffects {
  constructor(
        private readonly actions$: Actions,
        private readonly logOutService: LogOutKeepAliveService,
        private readonly userService: UserService,
        private readonly sessionStorageService: SessionStorageService
  ) {}

  public logout$ = createEffect(() => this.actions$.pipe(
    ofType(appActions.LOGOUT),
    map(() => {
      window.location.href = '/auth/logout';
    })
  ), { dispatch: false });

  public sigout$ = createEffect(() => this.actions$.pipe(
    ofType(appActions.SIGNED_OUT),
    switchMap(() => {
      return this.logOutService.logOut().pipe(
        map(() => new appActions.SignedOutSuccess())
      );
    })
  ));

  public signedOutSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(appActions.SIGNED_OUT_SUCCESS),
    map(() => new appActions.Go({ path: ['/signed-out'] }))
  ));

  public keepAlive$ = createEffect(() => this.actions$.pipe(
    ofType(appActions.KEEP_ALIVE),
    switchMap(() => {
      return this.logOutService.heartBeat();
    })
  ), { dispatch: false });

  public getUser$ = createEffect(() => this.actions$.pipe(
    ofType(appActions.GET_USER_DETAILS),
    switchMap(() => {
      return this.userService.getUserDetails()
        .pipe(
          map((userDetails: UserInterface) => {
            // EXUI-5080 - Store user details in session storage for log use
            this.sessionStorageService.setItem('userDetails', JSON.stringify(userDetails));
            return new appActions.GetUserDetailsSuccess(userDetails);
          }),
          catchError((error: HttpErrorResponse) => of(new appActions.GetUserDetailsFailure(error)))
        );
    })
  ));

  public addGlobalErrorEffect$ = createEffect(() => this.actions$.pipe(
    ofType(appActions.APP_ADD_GLOBAL_ERROR),
    map(() => {
      return new routerAction.Go({ path: ['/service-down'] });
    })
  ));
}
