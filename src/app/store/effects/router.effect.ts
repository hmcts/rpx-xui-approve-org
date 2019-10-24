import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import * as RouterActions from '../actions/router.action';

@Injectable()
export class RouterEffects {
  constructor(
    private readonly _actions$: Actions,
    private readonly _router: Router,
    private readonly _location: Location
  ) {}

  @Effect({ dispatch: false })
  public navigate$ = this._actions$.pipe(
    ofType(RouterActions.GO),
    map((action: RouterActions.Go) => action.payload),
    tap(({ path, query: queryParams, extras }) => {
      this._router.navigate(path, { queryParams, ...extras });
    })
  )
  ;

  @Effect({ dispatch: false })
  public navigateBack$ = this._actions$.pipe(
    ofType(RouterActions.BACK),
    tap(() => this._location.back())
  );


  @Effect({ dispatch: false })
  public navigateForward$ = this._actions$.pipe(
    ofType(RouterActions.FORWARD),
    tap(() => this._location.forward())
  );

}
