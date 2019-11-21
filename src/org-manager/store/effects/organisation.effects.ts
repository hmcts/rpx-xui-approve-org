import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import * as fromActions from '../actions';
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
  loadActiveOrganisations$ = this.actions$.pipe(
    ofType(fromActions.OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS),
    switchMap(() => {
      return this.organisationService.fetchOrganisations().pipe(
        map(organisationDetails => new fromActions.LoadActiveOrganisationSuccess(AppUtils.mapOrganisations(organisationDetails))),
        catchError((error: Error) => {
          this.loggerService.error(error.message);
          return of(new fromActions.LoadActiveOrganisationFail(error));
        })
      );
    })
  );
}
