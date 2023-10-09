import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { HttpErrorResponse } from '@angular/common/http';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserInterface } from '../../../models/user.model';
import { LogOutKeepAliveService } from '../../services/keep-alive/keep-alive.service';
import { UserService } from '../../services/user-service/user.service';
import * as routerAction from '../../store/actions/router.action';
import * as appActions from '../actions';
import { AppFeatureFlag } from '../reducers/app.reducer';
import { FeatureToggleService } from '@hmcts/rpx-xui-common-lib';

@Injectable()
export class AppEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly logOutService: LogOutKeepAliveService,
    private readonly userService: UserService,
    private readonly featureToggleService: FeatureToggleService
  ) { }

  @Effect({ dispatch: false })
  public logout$ = this.actions$.pipe(
      ofType(appActions.LOGOUT),
      map(() => {
        window.location.href = '/auth/logout';
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
      map(() => new appActions.Go({ path: ['/signed-out'] }))
    );

  @Effect({ dispatch: false })
  public keepAlive$ = this.actions$.pipe(
      ofType(appActions.KEEP_ALIVE),
      switchMap(() => {
        return this.logOutService.heartBeat();
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

  @Effect()
  public featureToggleConfig = this.actions$.pipe(
      ofType(appActions.LOAD_FEATURE_TOGGLE_CONFIG),
      map((action: appActions.LoadFeatureToggleConfig) => action.payload),
      switchMap((featureNames: string[]) => {
        return combineLatest(this.getObservable(featureNames)).pipe(
          map((feature) => this.getFeaturesPayload(feature, featureNames))
        );
      }
      )
    );

  @Effect()
  public addGlobalErrorEffect$ = this.actions$.pipe(
      ofType(appActions.APP_ADD_GLOBAL_ERROR),
      map(() => {
        return new routerAction.Go({ path: ['/service-down'] });
      })
    );

  public getFeaturesPayload(features: boolean[], featureNames: string[]): appActions.LoadFeatureToggleConfigSuccess {
    const result: AppFeatureFlag[] = features.map((isEnabled, i) => {
      return { isEnabled, featureName: featureNames[i] };
    });
    return new appActions.LoadFeatureToggleConfigSuccess(result);
  }

  public getObservable(featureNames: string[]): Observable<boolean>[] {
    let observables = new Array<Observable<boolean>>();
    featureNames.forEach((featureName) => {
      const observable = this.featureToggleService.isEnabled(featureName);
      observables = [...observables, observable];
    });
    return observables;
  }
}
