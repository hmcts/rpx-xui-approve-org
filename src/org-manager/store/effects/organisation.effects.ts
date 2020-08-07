import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LoggerService } from '../../../app/services/logger.service';
import * as fromRoot from '../../../app/store';
import { GlobalError } from '../../../app/store/reducers/app.reducer';
import { AppUtils } from '../../../app/utils/app-utils';
import { ErrorReport } from '../../models/errorReport.model';
import { OrganisationService, PbaAccountDetails, PendingOrganisationService } from '../../services';
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
  public loadOrganisationUsers$ = this.actions$.pipe(
    ofType(fromActions.OrgActionTypes.LOAD_ORGANISATION_USERS),
    map((action: fromActions.LoadOrganisationUsers) => action.payload),
    switchMap((payload) => {
      return this.organisationService.getOrganisationUsers(payload).pipe(
          map(data => new fromActions.LoadOrganisationUsersSuccess(AppUtils.mapUsers(data.users))),
          catchError((error: Error) => {
            this.loggerService.error(error);
            return of(new fromActions.LoadOrganisationUsersFail(error));
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
  public deletePendingOrg$ = this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.DELETE_PENDING_ORGANISATION),
    map((action: pendingOrgActions.DeletePendingOrganisation) => action.payload),
    switchMap(organisation => {

      const pendingOrganisation = AppUtils.mapOrganisationsVm([organisation])[0];

      return this.pendingOrgService.deletePendingOrganisations(pendingOrganisation).pipe(
        map(response => {
          return new pendingOrgActions.DeletePendingOrganisationSuccess(organisation);
        }),
        catchError(errorReport => {
          this.loggerService.error(errorReport.error.message);
          // Return an Action that adds an appropriate error message to the store, depending on the HTTP status code
          const action = OrganisationEffects.getErrorAction(errorReport.error);
          return of(action);
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

  /**
   * Navigate to Delete Organisation page.
   *
   * Navigates the User to Delete Organisation, and stores the Organisation in the Store.
   *
   * The User should be able to delete a pending organisations where there are duplicate requests for the same organisation
   * or, errors with the organisations details and so a new request needs to be submitted.
   */
  @Effect()
  public navToDeleteOrganisation$ = this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.DELETE_ORGANISATION),
    map(() => {
      return new fromRoot.Go({ path: ['/delete-organisation'] });
    })
  );

  /**
   * Navigate to the Delete Organisation Success page, on successfully deletion of an organisation
   * from PRD.
   */
  @Effect()
  public deletePendingOrgSuccess$ = this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.DELETE_PENDING_ORGANISATION_SUCCESS),
    map(() => {
      return new fromRoot.Go({ path: ['/delete-organisation-success'] });
    })
  );

  /**
   * Navigate to the Service Down page (used for displaying any errors), on an error occurring on deletion of an
   * organisation from PRD.
   */
  @Effect()
  public deletePendingOrgFail$ = this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.DELETE_PENDING_ORGANISATION_FAIL),
    map(() => {
      return new fromRoot.Go({ path: ['/service-down'] });
    })
  );

  public static getErrorAction(error: ErrorReport): Action {
    switch (error.apiStatusCode) {
      case 400:
      case 404:
        return new fromRoot.AddGlobalError(this.get400GenericError());
      case 403:
        return new fromRoot.AddGlobalError(this.get403Error());
      case 500:
        return new fromRoot.AddGlobalError(this.get500Error());
      default:
        return new fromRoot.AddGlobalError(this.get500Error());
    }
  }

  public static get400GenericError(): GlobalError {
    const errorMessage = {
      bodyText: 'Contact your support teams to delete this pending organisation.',
      urlText: null,
      url: null
    };
    const globalError = {
      header: 'Sorry, there is a problem with the organisation',
      errors: [errorMessage]
    };
    return globalError;
  }

  public static get403Error(): GlobalError {
    const globalError = {
      header: 'Sorry, you\'re not authorised to perform this action',
      errors: null
    };
    return globalError;
  }

  public static get500Error(): GlobalError {
    const errorMessage = {
      bodyText: 'Try again later.',
      urlText: null,
      url: null
    };
    const globalError = {
      header: 'Sorry, there is a problem with the service',
      errors: [errorMessage]
    };
    return globalError;
  }
}
