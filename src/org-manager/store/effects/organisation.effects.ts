import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as organisationActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import { OrganisationService } from '../../services';



@Injectable()
export class OrganisationEffects {
  constructor(
    private actions$: Actions,
    private organisationService: OrganisationService
  ) {}

  @Effect()
  loadOrganisations$ = this.actions$.pipe(
    ofType(organisationActions.LOAD_ORGANISATIONS),
    switchMap(() => {
      return this.organisationService.fetchOrganisations().pipe(
        map(organisationDetails => new organisationActions.LoadOrganisationSuccess(organisationDetails)),
        catchError(error => of(new organisationActions.LoadOrganisationFail(error)))
      );
    })
  );
}
