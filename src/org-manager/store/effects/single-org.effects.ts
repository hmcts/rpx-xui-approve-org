import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppUtils } from '../../../app/utils/app-utils';
import { OrganisationService } from '../../services';
import * as singleOrganisationActions from '../actions';

@Injectable()
export class SingleOrgEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly orgService: OrganisationService
  ) {}

  @Effect()
  public loadSingleOrg$ = this.actions$.pipe(
    ofType(singleOrganisationActions.LOAD_SINGLE_ORG),
    switchMap((data: { payload: any, type: string}) => {
      return this.orgService.getSingleOrganisation(data.payload).pipe(
        map(orgDetail => {
          return new singleOrganisationActions.LoadSingleOrgSuccess(AppUtils.mapOrganisation(orgDetail));
        }),
        catchError((error: Error) => {
          return of(new singleOrganisationActions.LoadSingleOrgFail(error));
        })
      );
    })
  );


}
