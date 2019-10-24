import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { LoggerService } from 'src/app/services/logger.service';
import { Go } from 'src/app/store';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import { PendingOrganisationService } from 'src/org-manager/services';
import { pendingOrganisationsMockCollection1 } from '../../mock/pending-organisation.mock';
import { ApprovePendingOrganisations, ApprovePendingOrganisationsSuccess, DisplayErrorMessageOrganisations } from '../actions/org-pending.actions';
import * as fromPendingOrganisationEffects from './org-pending.effects';
import { PendingOrgEffects } from './org-pending.effects';

export class LoggerServiceMock {
  error(err) {
    return err;
  }
}

describe('Pending Organisation Effects', () => {
  let actions$;
  let effects: PendingOrgEffects;
  const PendingOrganisationServiceMock = jasmine.createSpyObj('PendingOrganisationService', [
    'fetchPendingOrganisations',
    'approvePendingOrganisations'
  ]);

  const payload: OrganisationVM[] = pendingOrganisationsMockCollection1;
  const mockedLoggerService = jasmine.createSpyObj('mockedLoggerService', ['trace', 'info', 'debug', 'log', 'warn', 'error', 'fatal']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: PendingOrganisationService,
          useValue: PendingOrganisationServiceMock,
        },
        fromPendingOrganisationEffects.PendingOrgEffects,
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

    effects = TestBed.get(PendingOrgEffects);

  });

  describe('approvPendingOrganisations$', () => {
    it('should return a collection from approvePendingOrgs$ - ApprovePendingOrganisationsSuccess', () => {

      PendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(of(true));
      const action = new ApprovePendingOrganisations(payload);
      const completion = new ApprovePendingOrganisationsSuccess(true);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.approvePendingOrgs$).toBeObservable(expected);

      const successAction = new ApprovePendingOrganisationsSuccess(true);
      const successCompletion = new Go({ path: ['pending-organisations/approve-success'] });
      actions$ = hot('-a', { a: successAction });
      const successExpected = cold('--b', { b: successCompletion });
      expect(effects.approvePendingOrgsSuccess$).toBeObservable(successExpected);
    });
  });

  describe('approvPendingOrganisations$ error', () => {
    it('should return ApprovePendingOrganisationsOrganisationsFail', () => {
      PendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(throwError(''));
      const action = new ApprovePendingOrganisations(payload);
      const completion = new DisplayErrorMessageOrganisations('');
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.approvePendingOrgs$).toBeObservable(expected);
    });
  });
});
