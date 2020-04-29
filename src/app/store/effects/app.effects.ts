import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';


import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserInterface } from '../../..//models/user.model';
import { LogOutKeepAliveService } from '../../services/keep-alive/keep-alive.service';
import { UserService } from '../../services/user-service/user.service';
import * as routerAction from '../../store/actions/router.action';
import * as appActions from '../actions';

@Injectable()
export class AppEffects {
    constructor(
        private readonly actions$: Actions,
        private readonly logOutService: LogOutKeepAliveService,
        private readonly userService: UserService
    ) { }

    @Effect({ dispatch: false })
    public logout$ = this.actions$.pipe(
        ofType(appActions.LOGOUT),
        map(() => {
            window.location.href = '/api/logout';
        })
    );

    @Effect()
    public sigout$ = this.actions$.pipe(
        ofType(appActions.SIGNED_OUT),
        switchMap(() => {
            return this.logOutService.logOut().pipe(
                map(() => new appActions.SignedOutSuccess())
            );
        })
    );

    @Effect()
    public signedOutSuccess$ = this.actions$.pipe(
        ofType(appActions.SIGNED_OUT_SUCCESS),
        map(() => new appActions.Go({path: ['/signed-out']}))
    );

    @Effect({ dispatch: false})
    public keepAlive$ = this.actions$.pipe(
        ofType(appActions.KEEP_ALIVE),
        switchMap((date) => {
            return this.logOutService.heartBeat()
                ;
        })
    );

    @Effect()
    public getUser$ = this.actions$.pipe(
        ofType(appActions.GET_USER_DETAILS),
        switchMap(() => {
            return this.userService.getUserDetails()
                .pipe(
                    map((userDetails: UserInterface) => new appActions.GetUserDetailsSuccess(userDetails)),
                    catchError((error: HttpErrorResponse) => of(new appActions.GetUserDetailsFailure(error)))
                );
        })
    );

    public addGlobalErrorEffect$ = this.actions$.pipe(
      ofType(appActions.APP_ADD_GLOBAL_ERROR),
      map(() => {
        return new routerAction.Go({ path: ['/service-down'] });
      })
    );
}
