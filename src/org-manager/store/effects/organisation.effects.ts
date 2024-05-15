import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { NotificationBannerType } from 'src/models/notification-banner-type.enum';
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
  ) {}

  public loadActiveOrganisations$ = createEffect(() => this.actions$.pipe(
    ofType(fromActions.OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS),
    switchMap(() => {
      return this.organisationService.fetchOrganisations().pipe(
        map((organisationDetails) => new fromActions.LoadActiveOrganisationSuccess(AppUtils.mapOrganisations(organisationDetails))),
        catchError((error: Error) => {
          this.loggerService.error(error.message);
          return of(new fromActions.LoadActiveOrganisationFail(error));
        })
      );
    })
  ));

  public loadOrganisationUsers$ = createEffect(() => this.actions$.pipe(
    ofType(fromActions.OrgActionTypes.LOAD_ORGANISATION_USERS),
    map((action: fromActions.LoadOrganisationUsers) => action.payload),
    switchMap((payload) => {
      return this.organisationService.getOrganisationUsers(payload.orgId, payload.pageNo).pipe(
        map((data) => new fromActions.LoadOrganisationUsersSuccess(AppUtils.mapUsers(data.users))),
        catchError((error: Error) => {
          this.loggerService.error(error);
          return of(new fromActions.LoadOrganisationUsersFail(error));
        })
      );
    })
  ));

  public loadPendingOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.LOAD_PENDING_ORGANISATIONS),
    switchMap(() => {
      return this.pendingOrgService.fetchPendingOrganisations().pipe(
        take(1),
        map((pendingOrganisations) => new pendingOrgActions.LoadPendingOrganisationsSuccess(
          AppUtils.mapOrganisations(pendingOrganisations)),
        catchError((error: Error) => {
          this.loggerService.error(error.message);
          return of(new pendingOrgActions.LoadPendingOrganisationsFail(error));
        })
        ));
    })));

  public approvePendingOrgs$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS),
    map((action: pendingOrgActions.ApprovePendingOrganisations) => action.payload),
    switchMap((organisation) => {
      const pendingOrganisation = AppUtils.mapOrganisationsVm([organisation])[0];

      return this.pendingOrgService.approvePendingOrganisations(pendingOrganisation).pipe(
        take(1),
        map(() => {
          this.loggerService.log('Approved Organisation successfully');
          return new pendingOrgActions.ApprovePendingOrganisationsSuccess(organisation);
        }),
        catchError((error: Error) => {
          this.loggerService.error(error.message);
          return of(new pendingOrgActions.DisplayErrorMessageOrganisations(error));
        })
      );
    })
  ));

  public putReviewOrg$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.PUT_REVIEW_ORGANISATION),
    map((action: pendingOrgActions.PutReviewOrganisation) => action.payload),
    switchMap((organisation) => {
      let pendingOrganisation = AppUtils.mapOrganisationsVm([organisation])[0];
      pendingOrganisation = { ...pendingOrganisation, status: 'REVIEW' };
      return this.pendingOrgService.putReviewOrganisation(pendingOrganisation).pipe(
        take(1),
        map(() => {
          return new pendingOrgActions.PutReviewOrganisationSuccess(organisation);
        }),
        catchError((error: Error) => {
          this.loggerService.error(error.message);
          return of(new pendingOrgActions.PutReviewOrganisationFail(error));
        })
      );
    })
  ));

  // TODO: this can be removed once the organisation delete endpoint allows 'under review organisation' has been developed

  public deleteReviewOrganisation$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.DELETE_REVIEW_ORGANISATION),
    map((action: pendingOrgActions.DeleteReviewOrganisation) => action.payload),
    switchMap((organisation) => {
      let reviewOrganisation = AppUtils.mapOrganisationsVm([organisation])[0];
      reviewOrganisation = { ...reviewOrganisation, status: 'PENDING' };
      return this.pendingOrgService.putPendingOrganisation(reviewOrganisation).pipe(
        take(1),
        map(() => {
          const pendingOrganisation = AppUtils.mapOrganisation({ ...reviewOrganisation, status: 'REVIEW' });
          return new pendingOrgActions.DeletePendingOrganisation(pendingOrganisation);
        }),
        catchError((errorReport) => {
          this.loggerService.error(errorReport.error.message);
          const action = OrganisationEffects.getErrorAction(errorReport.error, 'under review');
          return of(action);
        })
      );
    })
  ));

  public putReviewOrgSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.PUT_REVIEW_ORGANISATION_SUCCESS),
    map(() => {
      return new fromRoot.Go({
        path: ['/organisation/pending'],
        extras: {
          state: {
            notificationBanners: [{ bannerType: NotificationBannerType.SUCCESS, bannerMessage: 'Registration put under review' }]
          }
        }
      });
    })
  ));

  public deletePendingOrg$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.DELETE_PENDING_ORGANISATION),
    map((action: pendingOrgActions.DeletePendingOrganisation) => action.payload),
    switchMap((organisation) => {
      const pendingOrganisation = AppUtils.mapOrganisationsVm([organisation])[0];

      return this.pendingOrgService.deletePendingOrganisations(pendingOrganisation).pipe(
        take(1),
        map(() => {
          return new pendingOrgActions.DeletePendingOrganisationSuccess(organisation);
        }),
        catchError((errorReport) => {
          this.loggerService.error(errorReport.error.message);
          // Return an Action that adds an appropriate error message to the store, depending on the HTTP status code
          const action = OrganisationEffects.getErrorActionForPending(errorReport.error);
          return of(action);
        })
      );
    })
  ));

  public approvePendingOrgsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS),
    map(() => {
      return new fromRoot.Go({
        path: ['/organisation/pending'],
        extras: {
          state: {
            notificationBanners: [{ bannerType: NotificationBannerType.SUCCESS, bannerMessage: 'Registration approved' }]
          }
        }
      });
    })
  ));

  public loadPbaAccountDetails$ = createEffect(() => this.actions$.pipe(
    ofType(fromActions.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME),
    map((action: fromActions.LoadPbaAccountsDetails) => action.payload),
    switchMap((payload) => {
      return this.pbaAccountDetails.getAccountDetails(payload.pbas).pipe(
        take(1),
        map((data) => new fromActions.LoadPbaAccountDetailsSuccess({ orgId: payload.orgId, data })),
        catchError((error: Error) => {
          this.loggerService.error(error);
          const data = [error];
          return of(new fromActions.LoadPbaAccountDetailsFail({ orgId: payload.orgId, data }));
        })
      );
    })
  ));

  public deleteOrganisation$ = createEffect(() => this.actions$.pipe(
    ofType(fromActions.OrgActionTypes.DELETE_ORGANISATION),
    map((action: fromActions.DeleteOrganisation) => action.payload),
    switchMap((organisation) => {
      const activeOrganisation = AppUtils.mapOrganisationsVm([organisation])[0];

      return this.organisationService.deleteOrganisation(activeOrganisation).pipe(
        map(() => {
          return new fromActions.DeleteOrganisationSuccess(organisation);
        }),
        catchError((errorReport) => {
          this.loggerService.error(errorReport.error.message);
          // Return an Action that adds an appropriate error message to the store, depending on the HTTP status code
          const action = OrganisationEffects.getErrorAction(errorReport.error);
          return of(action);
        })
      );
    })
  ));

  public getOrganisationDeletableStatus$ = createEffect(() => this.actions$.pipe(
    ofType(fromActions.OrgActionTypes.GET_ORGANISATION_DELETABLE_STATUS),
    map((action: fromActions.GetOrganisationDeletableStatus) => action.payload),
    switchMap((payload) => {
      return this.organisationService.getOrganisationDeletableStatus(payload).pipe(
        map((response) => new fromActions.GetOrganisationDeletableStatusSuccess(response.organisationDeletable)),
        catchError((errorReport) => {
          this.loggerService.error(errorReport.error.message);
          // Return an Action that adds an appropriate error message to the store, depending on the HTTP status code
          const action = OrganisationEffects.getErrorAction(errorReport.error);
          return of(action);
        })
      );
    })
  ));

  public addReviewOrganisations$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.ADD_REVIEW_ORGANISATIONS),
    map(() => {
      return new fromRoot.Go({ path: ['/approve-organisations'] });
    })
  ));

  /**
   * Navigate to Delete Organisation page.
   *
   * Navigates the User to Delete Organisation, and stores the Organisation in the Store.
   *
   * The User should be able to delete a pending organisations where there are duplicate requests for the same organisation
   * or, errors with the organisations details and so a new request needs to be submitted.
   */

  public navToDeleteOrganisation$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.NAV_TO_DELETE_ORGANISATION),
    map(() => {
      return new fromRoot.Go({ path: ['/delete-organisation'] });
    })
  ));

  public navToReviewOrganisation$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.NAV_TO_REVIEW_ORGANISATION),
    map(() => {
      return new fromRoot.Go({ path: ['/review-organisation'] });
    })
  ));

  /**
   * Navigate to the Delete Organisation Success page, on successful deletion of a pending organisation from PRD.
   */

  public deletePendingOrgSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.DELETE_PENDING_ORGANISATION_SUCCESS),
    map(() => {
      return new fromRoot.Go({
        path: ['/organisation/pending'],
        extras: {
          state: {
            notificationBanners: [{ bannerType: NotificationBannerType.SUCCESS, bannerMessage: 'Registration rejected' }]
          }
        }
      });
    })
  ));

  /**
   * Navigate to the Service Down page (used for displaying any errors), on an error occurring on deletion of an
   * organisation from PRD. Not strictly required because the "Add Global Error" action triggers an @Effect to
   * navigate to the Service Down page itself.
   */

  public deletePendingOrgFail$ = createEffect(() => this.actions$.pipe(
    ofType(pendingOrgActions.OrgActionTypes.DELETE_PENDING_ORGANISATION_FAIL),
    map(() => {
      return new fromRoot.Go({ path: ['/service-down'] });
    })
  ));

  /**
   * Navigate to the Delete Organisation Success page, on successful deletion of an organisation from PRD.
   */

  public deleteOrganisationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActions.OrgActionTypes.DELETE_ORGANISATION_SUCCESS),
    map(() => {
      return new fromRoot.Go({ path: ['/delete-organisation-success'] });
    })
  ));

  public static getErrorActionForPending(error: ErrorReport): Action {
    switch (error.apiStatusCode) {
      case 400:
      case 404:
        return new fromRoot.AddGlobalError(this.get400GenericErrorForPending());
      case 403:
        return new fromRoot.AddGlobalError(this.get403Error());
      case 500:
        return new fromRoot.AddGlobalError(this.get500Error());
      default:
        return new fromRoot.AddGlobalError(this.get500Error());
    }
  }

  public static getErrorAction(error: ErrorReport, status = 'active'): Action {
    switch (error.apiStatusCode) {
      case 400:
      case 404:
        return new fromRoot.AddGlobalError(this.get400GenericError(status));
      case 403:
        return new fromRoot.AddGlobalError(this.get403Error());
      case 500:
        return new fromRoot.AddGlobalError(this.get500Error());
      default:
        return new fromRoot.AddGlobalError(this.get500Error());
    }
  }

  public static get400GenericErrorForPending(): GlobalError {
    const errorMessage = {
      bodyText: 'Contact your support teams to delete this pending organisation.',
      urlText: null,
      url: null
    };
    return {
      header: 'Sorry, there is a problem with the organisation',
      errors: [errorMessage]
    };
  }

  public static get400GenericError(status: string): GlobalError {
    const errorMessage = {
      bodyText: `Contact your support teams to delete this ${status} organisation.`,
      urlText: null,
      url: null
    };
    return {
      header: 'Sorry, there is a problem with the organisation',
      errors: [errorMessage]
    };
  }

  public static get403Error(): GlobalError {
    return {
      header: 'Sorry, you\'re not authorised to perform this action',
      errors: null
    };
  }

  public static get500Error(): GlobalError {
    const errorMessage = {
      bodyText: 'Try again later.',
      urlText: null,
      url: null
    };
    return {
      header: 'Sorry, there is a problem with the service',
      errors: [errorMessage]
    };
  }
}
