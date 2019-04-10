import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as singleOrganisationActions from '../actions';
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
    ofType(singleOrganisationActions.LOAD_SINGLE_ORG),
    switchMap((data: { payload: string, type: string}) => {
      console.log('LOAD_SINGLE_ORGANISATION ::: data is', data)
      return this.feeAccountsService.fetchSingleOrg(data.payload).pipe(
        map(singleFeeAccountDetails => {
          console.log('singleOrganisationDetails ===>', singleFeeAccountDetails)
          return new singleOrganisationActions.LoadSingleOrgSuccess(singleFeeAccountDetails)

        }),
        catchError(error => of(new singleOrganisationActions.LoadSingleOrgFail(error)))
      );
    })
  );


}
