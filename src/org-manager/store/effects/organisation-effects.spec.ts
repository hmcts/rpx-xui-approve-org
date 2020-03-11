import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromEffects from './organisation.effects';
import { OrganisationEffects } from './organisation.effects';
import * as fromActons from '../actions/organisations.actions';
import {OrganisationService, PendingOrganisationService} from 'src/org-manager/services';
import { Go } from 'src/app/store';
import {LoadPbaAccuntsObj, PendingOrganisationsMockCollection1} from '../../mock/pending-organisation.mock';
import { Organisation, OrganisationVM, OrganisationUser } from 'src/org-manager/models/organisation';
import { LoggerService } from 'src/app/services/logger.service';
import { User } from '@hmcts/rpx-xui-common-lib';
import { AppUtils } from 'src/app/utils/app-utils';

export class LoggerServiceMock {
  error(err) {
    return err;
  }
}

describe('Organisation Effects', () => {
  let actions$;
  let effects: OrganisationEffects;
  const PendingOrganisationServiceMock = jasmine.createSpyObj('PendingOrganisationService', [
    'fetchPendingOrganisations',
    'approvePendingOrganisations'
  ]);
  const organisationServiceMock = jasmine.createSpyObj('OrganisationService', [
    'fetchOrganisations', 'getOrganisationUsers'
  ]);

  const payload: OrganisationVM[] = PendingOrganisationsMockCollection1;
  const mockedLoggerService = jasmine.createSpyObj('mockedLoggerService', ['trace', 'info', 'debug', 'log', 'warn', 'error', 'fatal']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: OrganisationService,
          useValue: OrganisationServiceMock,
        },
        {
          provide: PendingOrganisationService,
          useValue: PendingOrganisationServiceMock,
        },
        fromEffects.OrganisationEffects,
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

    effects = TestBed.get(OrganisationEffects);

  });

  describe('approvPendingOrganisations$', () => {
    xit('should return a collection from approvePendingOrgs$ - ApprovePendingOrganisationsSuccess', () => {

      PendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(of(true));
      const action = new fromActons.ApprovePendingOrganisations(payload[0]);
      const completion = new fromActons.ApprovePendingOrganisationsSuccess({} as OrganisationVM);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.approvePendingOrgs$).toBeObservable(expected);

      const successAction = new fromActons.ApprovePendingOrganisationsSuccess({} as OrganisationVM);
      const successCompletion = new Go({ path: ['/approve-organisations'] });
      actions$ = hot('-a', { a: successAction });
      const successExpected = cold('--b', { b: successCompletion });
      expect(effects.approvePendingOrgsSuccess$).toBeObservable(successExpected);
    });
  });

  describe('approvPendingOrganisations$ error', () => {
    it('should return ApprovePendingOrganisationsOrganisationsFail', () => {
      PendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(throwError(''));
      const action = new fromActons.ApprovePendingOrganisations(payload[0]);
      const completion = new fromActons.DisplayErrorMessageOrganisations('');
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.approvePendingOrgs$).toBeObservable(expected);
    });
  });

  describe('loadActiveOrganisations$ error', () => {
    it('should return LoadOrganisationsFail', () => {
      OrganisationServiceMock.fetchOrganisations.and.returnValue(throwError(new Error()));
      const action = new fromActons.LoadActiveOrganisation();
      const completion = new fromActons.LoadActiveOrganisationFail(new Error());
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadActiveOrganisations$).toBeObservable(expected);
    });
  });
});


