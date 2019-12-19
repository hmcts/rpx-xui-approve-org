import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as fromActions from '../actions';
import * as fromRood from '../../../app/store';
import {UpdatePbaServices} from '../../services';
import {LoggerService} from '../../../app/services/logger.service';
import {PbaAccountDetails} from '../../services/pba-account-details.services';

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
  loadPba$ = this.actions$.pipe(
      ofType(fromActions.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME),
      map((action: fromActions.SubmitPba) => action.payload),
      switchMap((body) => {
        return this.pbaAccountDetails.getAccountDetails(body).pipe(
            map(() => new fromActions.LoadPbaAccountNameSuccess(body)),
            catchError((error: Error) => {
              this.loggerService.error(error);
              return of(new fromActions.LoadPbaAccountNameFail(error));
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
