import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { PendingOrganisationService } from 'src/org-pending/services/pending-organisation.service';
import * as pendingOrgActions from '../actions/org-pending.actions';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
@Injectable()
 export class PendingOrgEffects {
     constructor(
        private actions$: Actions,
        private pendingOrgService: PendingOrganisationService) {}

        @Effect()
        loadPendingOrgs$ = this.actions$.pipe(
            ofType(pendingOrgActions.PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS),
            switchMap(() => {
                return this.pendingOrgService.fetchPendingOrganisations().pipe(
                  map(pendingOrganisations => new pendingOrgActions.LoadPendingOrganisationsSuccess(pendingOrganisations)),
                  catchError(error => of(new pendingOrgActions.LoadPendingOrganisationsFail(error)))
                );
              })
            );

          @Effect()
          loadPendingOrgsCount$ = this.actions$.pipe(
              ofType(pendingOrgActions.PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_COUNT),
              switchMap(() => {
                  return this.pendingOrgService.fetchPendingOrganisationsCount().pipe(
                    map(pendingOrganisationsCount => new pendingOrgActions.LoadPendingOrganisationsCountSuccess(pendingOrganisationsCount)),
                    catchError(error => of(new pendingOrgActions.LoadPendingOrganisationsCountFail(error)))
                  );
                })
              );
            }
