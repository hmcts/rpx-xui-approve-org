import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import * as appActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UserInterface} from '../../../models/user.model';
import {HttpErrorResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {LogOutKeepAliveService} from '../../services/keep-alive/keep-alive.services';
import {UserService} from '../../services/user-service/user.service';

@Injectable()
export class AppEffects {
    constructor(
        private actions$: Actions,
        private logOutService: LogOutKeepAliveService,
        private userService: UserService
    ) { }

    @Effect({ dispatch: false })
    logout$ = this.actions$.pipe(
        ofType(appActions.LOGOUT),
        map(() => {
            window.location.href = '/api/logout';
        })
    );


    @Effect()
    sigout$ = this.actions$.pipe(
        ofType(appActions.SIGNED_OUT),
        switchMap(() => {
            return this.logOutService.logOut().pipe(
                map(() => new appActions.SignedOutSuccess())
            );
        })
    );

    @Effect()
    signedOutSuccess$ = this.actions$.pipe(
        ofType(appActions.SIGNED_OUT_SUCCESS),
        map(() => new appActions.Go({path: ['/signed-out']}))
    );

    @Effect({ dispatch: false})
    keepAlive$ = this.actions$.pipe(
        ofType(appActions.KEEP_ALIVE),
        switchMap((date) => {
            return this.logOutService.heartBeat()
                ;
        })
    );

    @Effect()
    getUser$ = this.actions$.pipe(
        ofType(appActions.GET_USER_DETAILS),
        switchMap(() => {
            return this.userService.getUserDetails()
                .pipe(
                    map((userDetails: UserInterface) => new appActions.GetUserDetailsSuccess(userDetails)),
                    catchError((error: HttpErrorResponse) => of(new appActions.GetUserDetailsFailure(error)))
                );
        })
    );

}
