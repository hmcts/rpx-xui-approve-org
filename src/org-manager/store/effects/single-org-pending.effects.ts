import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PendingOrganisationService } from '../../../org-manager/services';
import * as singleOrganisationActions from '../../../org-manager/store/actions';

@Injectable()
export class SingleOrgPendingEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly orgService: PendingOrganisationService
  ) {}

  @Effect()
  public loadSingleOrg$ = this.actions$.pipe(
    ofType(singleOrganisationActions.SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS),
    switchMap((data: { payload: { id: number | string }, type: string}) => {
      return this.orgService.getSingleOrganisation(data.payload).pipe(
        map((singleOrgDetails: any) => {
          return new singleOrganisationActions.LoadSinglePendingOrgSuccess(singleOrgDetails[0]);
        }),
        catchError((error: Error) => {
          return of(new singleOrganisationActions.LoadSinglePendingOrgFail(error));
        })
      );
    })
  );
}
