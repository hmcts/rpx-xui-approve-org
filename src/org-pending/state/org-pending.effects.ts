 import { Injectable } from '@angular/core'
import { Actions, Effect, ofType } from '@ngrx/effects';
import { PendingOrganisationService } from 'src/org-pending/services/pending-organisation.service';
import * as pendingOrgActions from './actions/pending-org.actions'
import { mergeMap, map } from 'rxjs/operators';
import { PendingOrganisation } from "../models/pending-organisation";
 
@Injectable()
 export class PendingOrgEffects {
     constructor(private actions$: Actions,
        private pendingOrgService: PendingOrganisationService){}

        @Effect()
        loadPendingOrgs$ = this.actions$.pipe(
            ofType(pendingOrgActions.PendingOrgActionTypes.Load),
            mergeMap((action:pendingOrgActions.Load) => this.pendingOrgService.fetchPendingOrganisations().pipe
            (
                map((pendingOrganisations: PendingOrganisation[]) => new pendingOrgActions.LoadSuccess(pendingOrganisations)))
            ))
            }




 