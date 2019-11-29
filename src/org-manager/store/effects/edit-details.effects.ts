import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as fromActions from '../actions';
import {UpdatePbaServices} from '../../services';
import {LoggerService} from '../../../app/services/logger.service';

@Injectable()
export class EditDetailsEffects {
  constructor(
    private actions$: Actions,
    private updatePbaServices: UpdatePbaServices,
    private loggerService: LoggerService
  ) { }

  @Effect()
  submitPBA = this.actions$.pipe(
    ofType(fromActions.SUBMIT_PBA),
    map((action: fromActions.SubmitPba) => action.payload),
    switchMap((body) => {
      return this.updatePbaServices.updatePba(body).pipe(
        map(() => new fromActions.SubmitPbaSuccess(body)),
        catchError((error: Error) => {
          this.loggerService.error(error.message);
          return of(new fromActions.SubmitPbaFailure(error));
        })
      );
    })
  );
}
