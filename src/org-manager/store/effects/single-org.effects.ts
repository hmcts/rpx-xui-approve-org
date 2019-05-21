import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as singleOrganisationActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {OrganisationService} from '../../services';



@Injectable()
export class SingleOrgEffects {
  constructor(
    private actions$: Actions,
    private orgService: OrganisationService
  ) {}

  @Effect()
  loadSingleOrg$ = this.actions$.pipe(
    ofType(singleOrganisationActions.LOAD_SINGLE_ORG),
    switchMap((data: { payload: string, type: string}) => {
      console.log('LOAD_SINGLE_ORGANISATION ::: data is', data);
      return this.orgService.getSingleOrganisation(data.payload).pipe(
        map(singleOrgDetails => {
          console.log('singleOrganisationDetails  manager===>', singleOrgDetails);
          return new singleOrganisationActions.LoadSingleOrgSuccess(singleOrgDetails[0]);

        }),
        catchError(error => of(new singleOrganisationActions.LoadSingleOrgFail(error)))
      );
    })
  );


}
