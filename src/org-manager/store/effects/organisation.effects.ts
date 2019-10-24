import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LoggerService } from '../../../app/services/logger.service';
import { AppUtils } from '../../../app/utils/app-utils';
import { OrganisationService } from '../../services';
import * as organisationActions from '../actions';

@Injectable()
export class OrganisationEffects {
  constructor(
    private readonly _actions$: Actions,
    private readonly _organisationService: OrganisationService,
    private readonly _loggerService: LoggerService
  ) {}

  @Effect()
  public loadOrganisations$ = this._actions$.pipe(
    ofType(organisationActions.LOAD_ORGANISATIONS),
    switchMap(() => {
      return this._organisationService.fetchOrganisations().pipe(
        map(organisationDetails => new organisationActions.LoadOrganisationSuccess(AppUtils.mapOrganisations(organisationDetails))),
        catchError((error: Error) => {
          this._loggerService.error(error.message);
          return of(new organisationActions.LoadOrganisationFail(error));
        })
      );
    })
  );
}
