import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as singleOrganisationActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {OrganisationService} from '../../services';
import { AppUtils } from '../../../app/utils/app-utils';



@Injectable()
export class SingleOrgEffects {
  constructor(
    private actions$: Actions,
    private orgService: OrganisationService,
    // private loggerService: LoggerService
  ) {}

  @Effect()
  loadSingleOrg$ = this.actions$.pipe(
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
