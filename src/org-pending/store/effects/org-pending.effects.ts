 import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { PendingOrganisationService } from 'src/org-pending/services/pending-organisation.service';
import * as pendingOrgActions from '../actions/org-pending.actions';
import { mergeMap, map, switchMap, catchError } from 'rxjs/operators';
import { PendingOrganisation } from '../../models/pending-organisation';
import { of } from 'rxjs';
@Injectable()
 export class PendingOrgEffects {
     constructor(
        private actions$: Actions,
        private pendingOrgService: PendingOrganisationService) {}

        @Effect()
        loadPendingOrgs$ = this.actions$.pipe(
            ofType(pendingOrgActions.PendingOrgActionTypes.Load),
            switchMap(() => {
                return this.pendingOrgService.fetchPendingOrganisations().pipe(
                  map(pendingOrganisations => new pendingOrgActions.LoadPendingOrganisationsSuccess(pendingOrganisations)),
                  catchError(error => of(new pendingOrgActions.LoadPendingOrganisationsFail(error)))
                );
              })
            );
            }

  