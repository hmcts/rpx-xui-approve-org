import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as fromActions from '../actions';
import * as fromRood from '../../../app/store';
import {UpdatePbaServices} from '../../services';
import {LoggerService} from '../../../app/services/logger.service';
import {PbaAccountDetails} from '../../services';

@Injectable()
export class EditDetailsEffects {
  constructor(
    private actions$: Actions,
    private updatePbaServices: UpdatePbaServices,
    private loggerService: LoggerService,
    private pbaAccountDetails: PbaAccountDetails
  ) { }

  @Effect()
  submitPBA$ = this.actions$.pipe(
    ofType(fromActions.SUBMIT_PBA),
    map((action: fromActions.SubmitPba) => action.payload),
    switchMap((body) => {
      return this.updatePbaServices.updatePba(body).pipe(
        map(() => new fromActions.SubmitPbaSuccess(body)),
        catchError((error: Error) => {
          this.loggerService.error(error);
          return of(new fromActions.SubmitPbaFailure(error));
        })
      );
    })
  );

  @Effect()
  loadPbaAccountDetails$ = this.actions$.pipe(
      ofType(fromActions.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME),
      map((action: fromActions.LoadPbaAccountName) => action.payload),
      switchMap((payload) => {
        return this.pbaAccountDetails.getAccountDetails(payload.pbas).pipe(
            map((data) => new fromActions.LoadPbaAccountNameSuccess({orgId: payload.orgId, data})),
            catchError((error: Error) => {
              this.loggerService.error(error);
              return of(new fromActions.LoadPbaAccountNameFail({orgId: payload.orgId, error}));
            })
        );
      })
  );

  @Effect()
  submitPbaSuccess$ = this.actions$.pipe(
      ofType(fromActions.SUBMIT_PBA_SUCCESS),
      map(() => {
        return new fromRood.Back();
      }),
  );
}
