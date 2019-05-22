import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as singleOrganisationActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {PendingOrganisationService} from '../../services';



@Injectable()
export class SingleOrgEffects {
  constructor(
    private actions$: Actions,
    private orgService: PendingOrganisationService
  ) {}

  @Effect()
  loadSingleOrg$ = this.actions$.pipe(
    ofType(singleOrganisationActions.SinglePendingOrgActionTypes.LOAD),
    switchMap((data: { payload: string, type: string}) => {
      console.log('LOAD_SINGLE_ORGANISATION pending ::: data is', data);
      return this.orgService.getSingleOrganisation(data.payload).pipe(
        map(singleOrgDetails => {
          console.log('singleOrganisationDetails this effect pending ===>', singleOrgDetails);
          return new singleOrganisationActions.LoadSingleOrgSuccess(singleOrgDetails[0]);

        }),
        catchError(error => of(new singleOrganisationActions.LoadSingleOrgFail(error)))
      );
    })
  );
}
