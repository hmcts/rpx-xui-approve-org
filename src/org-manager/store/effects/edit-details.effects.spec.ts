import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromEffects from './edit-details.effects';
import * as fromActions from '../actions/edit-details.actions';
import { UpdatePbaServices} from 'src/org-manager/services';
import { LoggerService } from 'src/app/services/logger.service';
import {EditDetailsEffects} from './edit-details.effects';
import {of, throwError} from 'rxjs';

export class LoggerServiceMock {
  error(err) {
    return err;
  }
}

describe('Organisation Effects', () => {
  let actions$;
  let effects: EditDetailsEffects;
  const updatePbaServicesMock = jasmine.createSpyObj('UpdatePbaServices', [
    'updatePba',
  ]);

  const mockedLoggerService = jasmine.createSpyObj('mockedLoggerService', ['trace', 'info', 'debug', 'log', 'warn', 'error', 'fatal']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: UpdatePbaServices,
          useValue: updatePbaServicesMock,
        },
        fromEffects.EditDetailsEffects,
        provideMockActions(() => actions$),
        {
          provide: LoggerService,
          useClass: LoggerServiceMock
        },
        {
          provide: LoggerService,
          useValue: mockedLoggerService
        },
      ]
    });

    effects = TestBed.get(EditDetailsEffects);

  });

  describe('Edit Details Effects ', () => {
    it('should submit PBA successfully', () => {
      updatePbaServicesMock.updatePba.and.returnValue(of(true));
      const payload = {paymentAccounts: ['PBA1234567'], orgId: '1234t6'};
      const action = new fromActions.SubmitPba(payload);
      const completion = new fromActions.SubmitPbaSuccess(payload);
      actions$ = hot('-a', {a: action});
      const expected = cold('-b', {b: completion});
      expect(effects.submitPBA$).toBeObservable(expected);
    });


    it('should submit PBA Fail', () => {
      updatePbaServicesMock.updatePba.and.returnValue(throwError(''));
      const payload = {paymentAccounts: ['PBA1234567'], orgId: '1234t6'};
      const action = new fromActions.SubmitPba(payload);
      const completion = new fromActions.SubmitPbaFailure('' as any);
      actions$ = hot('-a', {a: action});
      const expected = cold('-b', {b: completion});
      expect(effects.submitPBA$).toBeObservable(expected);
    });
  });
});

