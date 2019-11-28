import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as fromActions from '../actions';
import {UpdatePbaServices} from '../../services/update-pba.services';
import {LoggerService} from '../../../app/services/logger.service';

@Injectable()
export class EditDetailsEffects {
  constructor(
    private actions$: Actions,
    private updatePbaServices: UpdatePbaServices,
    private logerService: LoggerService
  ) { }

  @Effect()
  submitPBA = this.actions$.pipe(
    ofType(fromActions.SUBMIT_PBA),
    map((action: fromActions.SubmitPba) => action.payload),
    switchMap((body) => {
      return this.updatePbaServices.updatePba(body).pipe(
        map(serverResponse => new fromActions.SubmitPbaSuccsess(serverResponse)),
        catchError((error: Error) => {
          this.logerService.error(error.message);
          return of(new fromActions.SubmitPbaFailure(error));
        })
      );
    })
  );
}
