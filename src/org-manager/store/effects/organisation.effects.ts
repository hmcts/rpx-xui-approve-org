import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { PendingOrganisationService } from 'src/org-manager/services/pending-organisation.service';
import * as pendingOrgActions from '../actions/organisations.actions';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as fromRoot from '../../../app/store';
import { AppUtils } from '../../../app/utils/app-utils';
import { LoggerService } from '../../../app/services/logger.service';
import * as fromActions from '../actions';
import {OrganisationService, PbaAccountDetails} from '../../services';

@Injectable()
export class OrganisationEffects {
  constructor(
    private actions$: Actions,
    private pendingOrgService: PendingOrganisationService,
    private loggerService: LoggerService,
    private organisationService: OrganisationService,
    private pbaAccountDetails: PbaAccountDetails
  ) { }

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

  @Effect()
  loadPendingOrgs$ = this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.LOAD_PENDING_ORGANISATIONS),
    switchMap(() => {
      return this.pendingOrgService.fetchPendingOrganisations().pipe(
        map(pendingOrganisations => new pendingOrgActions.LoadPendingOrganisationsSuccess(
        AppUtils.mapOrganisations(pendingOrganisations)),
        catchError((error: Error) => {
         this.loggerService.error(error.message);
         return of(new pendingOrgActions.LoadPendingOrganisationsFail(error));
        })
      ));
    }));

  @Effect()
  approvePendingOrgs$ = this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS),
    map((action: pendingOrgActions.ApprovePendingOrganisations) => action.payload),
    switchMap(organisation => {
      const pendingOrganisation = AppUtils.mapOrganisationsVm([organisation])[0];

      return this.pendingOrgService.approvePendingOrganisations(pendingOrganisation).pipe(
        map(response => {
          this.loggerService.log('Approved Organisation successfully');
          return new pendingOrgActions.ApprovePendingOrganisationsSuccess(organisation);
        }),
        catchError((error: Error) => {
         this.loggerService.error(error.message);
         return of(new pendingOrgActions.DisplayErrorMessageOrganisations(error));
        })
      );
    })
  );

  @Effect()
  approvePendingOrgsSuccess$ = this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS),
    map(() => {
      return new fromRoot.Go({ path: ['/approve-organisations-success'] });
    })
  );

  @Effect()
  loadPbaAccountDetails$ = this.actions$.pipe(
    ofType(fromActions.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME),
    map((action: fromActions.LoadPbaAccountsDetails) => action.payload),
    switchMap((payload) => {
      return this.pbaAccountDetails.getAccountDetails(payload.pbas).pipe(
          map((data) => new fromActions.LoadPbaAccountDetailsSuccess({orgId: payload.orgId, data})),
          catchError((error: Error) => {
            this.loggerService.error(error);
            const data = [error];
            return of(new fromActions.LoadPbaAccountDetailsFail({orgId: payload.orgId, data}));
          })
      );
    })
  );
}
