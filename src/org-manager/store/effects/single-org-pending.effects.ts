// import {Injectable} from '@angular/core';
// import {Actions, Effect, ofType} from '@ngrx/effects';
// import * as singleOrganisationActions from '../../../org-manager/store/actions';
// import {catchError, map, switchMap} from 'rxjs/operators';
// import {of} from 'rxjs';
// import {PendingOrganisationService} from '../../../org-manager/services';
// import { LoggerService } from 'src/app/services/logger.service';
//
// @Injectable()
// export class SingleOrgPendingEffects {
//   constructor(
//     private actions$: Actions,
//     private orgService: PendingOrganisationService,
//     // private loggerService: LoggerService
//   ) {}
//
//   @Effect()
//   loadSingleOrg$ = this.actions$.pipe(
//     ofType(singleOrganisationActions.SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS),
//     switchMap((data: { payload: string, type: string}) => {
//       return this.orgService.getSingleOrganisation(data.payload).pipe(
//         map(singleOrgDetails => {
//           return new singleOrganisationActions.LoadSinglePendingOrgSuccess(singleOrgDetails[0]);
//         }),
//         catchError((error: Error) => {
//         //  this.loggerService.error(error.message);
//           return of(new singleOrganisationActions.LoadSinglePendingOrgFail(error));
//         })
//       );
//     })
//   );
// }
