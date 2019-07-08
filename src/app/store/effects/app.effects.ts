import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import * as appActions from '../actions';
import { map } from 'rxjs/operators';

@Injectable()
export class AppEffects {
    constructor(
        private actions$: Actions
    ) { }

    @Effect({ dispatch: false })
    logout$ = this.actions$.pipe(
        ofType(appActions.LOGOUT),
        map(() => {
            window.location.href = '/api/logout';
        })
    );

}
