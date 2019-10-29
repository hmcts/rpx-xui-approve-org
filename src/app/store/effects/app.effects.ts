import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import * as appActions from '../actions';

@Injectable()
export class AppEffects {
    constructor(
        private readonly actions$: Actions,
    ) { }

    @Effect({ dispatch: false })
    public logout$ = this.actions$.pipe(
        ofType(appActions.LOGOUT),
        map(() => {
            window.location.href = '/api/logout';
        })
    );

}
