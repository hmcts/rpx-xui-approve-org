import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PendingOrganisationService } from 'src/org-manager/services/pending-organisation.service';
import { LoggerService } from '../../../app/services/logger.service';
import * as fromRoot from '../../../app/store';
import { AppUtils } from '../../../app/utils/app-utils';
import {OrganisationService, PbaAccountDetails} from '../../services';
import * as fromActions from '../actions';
import * as pendingOrgActions from '../actions/organisations.actions';

@Injectable()
export class OrganisationEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly pendingOrgService: PendingOrganisationService,
    private readonly loggerService: LoggerService,
    private readonly organisationService: OrganisationService,
    private readonly pbaAccountDetails: PbaAccountDetails
  ) { }

  @Effect()
  public loadActiveOrganisations$ = this.actions$.pipe(
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
  public loadPendingOrgs$ = this.actions$.pipe(
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
  public approvePendingOrgs$ = this.actions$.pipe(
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
  public approvePendingOrgsSuccess$ = this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS),
    map(() => {
      return new fromRoot.Go({ path: ['/approve-organisations-success'] });
    })
  );

  @Effect()
  public loadPbaAccountDetails$ = this.actions$.pipe(
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

  @Effect()
  public addReviewOrganisations$ = this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.ADD_REVIEW_ORGANISATIONS),
    map(() => {
      return new fromRoot.Go({ path: ['/approve-organisations'] });
    })
  );
}
