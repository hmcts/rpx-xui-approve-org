import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LoggerService } from '../../../app/services/logger.service';
import * as fromRood from '../../../app/store';
import { UpdatePbaServices } from '../../services';
import * as fromActions from '../actions';

@Injectable()
export class EditDetailsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly updatePbaServices: UpdatePbaServices,
    private readonly loggerService: LoggerService
  ) {}

  @Effect()
  public submitPBA$ = this.actions$.pipe(
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
  public submitPbaSuccess$ = this.actions$.pipe(
      ofType(fromActions.SUBMIT_PBA_SUCCESS),
      map(() => {
        return new fromRood.Back();
      }),
    );
}
