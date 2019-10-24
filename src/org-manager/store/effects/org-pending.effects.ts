import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PendingOrganisationService } from 'src/org-manager/services/pending-organisation.service';
import { LoggerService } from '../../../app/services/logger.service';
import * as fromRoot from '../../../app/store';
import { AppUtils } from '../../../app/utils/app-utils';
import * as pendingOrgActions from '../../../org-manager/store/actions/org-pending.actions';

@Injectable()
export class PendingOrgEffects {
  constructor(
    private readonly _actions$: Actions,
    private readonly _pendingOrgService: PendingOrganisationService,
    private readonly _loggerService: LoggerService
  ) { }

  @Effect()
  public loadPendingOrgs$ = this._actions$.pipe(
    ofType(pendingOrgActions.PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS),
    switchMap(() => {
      return this._pendingOrgService.fetchPendingOrganisations().pipe(
        map(pendingOrganisations => new pendingOrgActions.LoadPendingOrganisationsSuccess(
        AppUtils.mapOrganisations(pendingOrganisations)),
        catchError((error: Error) => {
         this._loggerService.error(error.message);
         return of(new pendingOrgActions.LoadPendingOrganisationsFail(error));
        })
      ));
    }));

  @Effect()
  public approvePendingOrgs$ = this._actions$.pipe(
    ofType(pendingOrgActions.PendingOrgActionTypes.APPROVE_PENDING_ORGANISATIONS),
    map((action: pendingOrgActions.ApprovePendingOrganisations) => action.payload),
    switchMap(payload => {
      const pendingOrganisation = AppUtils.mapOrganisationsVm(payload)[0];
      return this._pendingOrgService.approvePendingOrganisations(pendingOrganisation).pipe(
        map(pendingOrganisations => {
          this._loggerService.log('Approved Organisation successfully');
          return new pendingOrgActions.ApprovePendingOrganisationsSuccess(pendingOrganisations);
        }),
        catchError((error: Error) => {
         this._loggerService.error(error.message);
         return of(new pendingOrgActions.DisplayErrorMessageOrganisations(error));
        })
      );
    })
  );

  @Effect()
  public approvePendingOrgsSuccess$ = this._actions$.pipe(
    ofType(pendingOrgActions.PendingOrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS),
    map(() => {
      return new fromRoot.Go({ path: ['pending-organisations/approve-success'] });
    })
  );
}
