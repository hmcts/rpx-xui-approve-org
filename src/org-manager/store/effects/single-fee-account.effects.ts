import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as singleFeeAccountActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {OrganisationService} from '../../services';



@Injectable()
export class SingleFeeAccountEffects {
  constructor(
    private actions$: Actions,
    private feeAccountsService: OrganisationService
  ) {}

  @Effect()
  loadSingleFeeAccount$ = this.actions$.pipe(
    ofType(singleFeeAccountActions.LOAD_SINGLE_FEE_ACCOUNT),
    switchMap((data: { payload: string, type: string}) => {
      console.log('LOAD_SINGLE_FEE_ACCOUNT ::: data is', data)
      return this.feeAccountsService.fetchSingleFeeAccount(data.payload).pipe(
        map(singleFeeAccountDetails => {
          console.log('singleFeeAccountDetails ===>', singleFeeAccountDetails)
          return new singleFeeAccountActions.LoadSingleFeeAccountSuccess(singleFeeAccountDetails)

        }),
        catchError(error => of(new singleFeeAccountActions.LoadSingleFeeAccountFail(error)))
      );
    })
  );


}
