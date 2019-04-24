import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as pendingOrganisationActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import { PendingOrganisationService } from '../../services';



@Injectable()
export class PendingOrganisationEffects {
  constructor(
    private actions$: Actions,
    private pendingOrganisationService: PendingOrganisationService
  ) {}

  @Effect()
  loadPendingOrganisations$ = this.actions$.pipe(
    ofType(pendingOrganisationActions.LOAD_PENDING_ORGANISATIONS),
    switchMap(() => {
      console.log("effects in pending");
      return this.pendingOrganisationService.fetchPendingOrganisations().pipe(
        map(pendingOrganisationDetails => new pendingOrganisationActions.LoadPendingOrganisationSuccess(pendingOrganisationDetails)),
        catchError(error => of(new pendingOrganisationActions.LoadPendingOrganisationFail(error)))
      );
    })
  );

}
