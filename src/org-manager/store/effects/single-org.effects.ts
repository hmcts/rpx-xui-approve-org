import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as singleOrganisationActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {OrganisationService} from '../../services';
import { LoggerService } from '../../../app/services/logger.service';



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
    switchMap((data: { payload: string, type: string}) => {
      return this.orgService.getSingleOrganisation(data.payload).pipe(
        map(singleOrgDetails => {
          return new singleOrganisationActions.LoadSingleOrgSuccess(singleOrgDetails[0]);
        }),
        catchError((error: Error) => {
         // this.loggerService.error(error.message);
          return of(new singleOrganisationActions.LoadSingleOrgFail(error));
        })
      );
    })
  );


}
