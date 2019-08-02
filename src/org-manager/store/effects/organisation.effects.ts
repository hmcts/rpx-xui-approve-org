import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as organisationActions from '../actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import { OrganisationService } from '../../services';
import { AppUtils } from '../../../app/utils/app-utils';
import { LoggerService } from '../../../app/services/logger.service';



@Injectable()
export class OrganisationEffects {
  constructor(
    private actions$: Actions,
    private organisationService: OrganisationService,
    private loggerService: LoggerService
  ) {}

  @Effect()
  loadOrganisations$ = this.actions$.pipe(
    ofType(organisationActions.LOAD_ORGANISATIONS),
    switchMap(() => {
      return this.organisationService.fetchOrganisations().pipe(
        map(organisationDetails => new organisationActions.LoadOrganisationSuccess(AppUtils.mapOrganisations(organisationDetails))),
        catchError(error => {
          this.loggerService.error(error);
          return of(new organisationActions.LoadOrganisationFail(error));
        })
      );
    })
  );
}
