import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { map } from 'rxjs/operators';
import * as fromRoot from '../../store';
import * as appActions from '../actions';

@Injectable()
export class AppEffects {
    constructor(
        private actions$: Actions,
    ) { }

    @Effect({ dispatch: false })
    logout$ = this.actions$.pipe(
        ofType(appActions.LOGOUT),
        map(() => {
            window.location.href = '/api/logout';
        })
    );

    @Effect()
    public addGlobalErrorEffect$ = this.actions$.pipe(
      ofType(appActions.APP_ADD_GLOBAL_ERROR),
      map(() => {
        return new fromRoot.Go({ path: ['/service-down'] });
      })
    );

}
