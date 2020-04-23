import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromEffects from './organisation.effects';
import { OrganisationEffects } from './organisation.effects';
import * as fromActons from '../actions/organisations.actions';
import {OrganisationService, PbaAccountDetails, PendingOrganisationService} from 'src/org-manager/services';
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
  const pendingOrganisationServiceMock = jasmine.createSpyObj('PendingOrganisationService', [
    'fetchPendingOrganisations',
    'approvePendingOrganisations'
  ]);
  const organisationServiceMock = jasmine.createSpyObj('OrganisationService', [
    'fetchOrganisations', 'getOrganisationUsers'
  ]);

  const getAccountDetailsServiceMock = jasmine.createSpyObj('PbaAccountDetails', [
    'getAccountDetails',
  ]);

  const payload: OrganisationVM[] = PendingOrganisationsMockCollection1;
  const mockedLoggerService = jasmine.createSpyObj('mockedLoggerService', ['trace', 'info', 'debug', 'log', 'warn', 'error', 'fatal']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: OrganisationService,
          useValue: organisationServiceMock,
        },
        {
          provide: PendingOrganisationService,
          useValue: pendingOrganisationServiceMock,
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
        {
          provide: PbaAccountDetails,
          useValue: getAccountDetailsServiceMock
        }
      ]
    });

    effects = TestBed.get(OrganisationEffects);

  });

  xdescribe('approvPendingOrganisations$', () => {
    it('should return a collection from approvePendingOrgs$ - ApprovePendingOrganisationsSuccess', () => {

      pendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(of(true));
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
      pendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(throwError(''));
      const action = new fromActons.ApprovePendingOrganisations(payload[0]);
      const completion = new fromActons.DisplayErrorMessageOrganisations('');
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.approvePendingOrgs$).toBeObservable(expected);
    });
  });

  describe('loadActiveOrganisations$ error', () => {
    it('should return LoadOrganisationsFail', () => {
      organisationServiceMock.fetchOrganisations.and.returnValue(throwError(new Error()));
      const action = new fromActons.LoadActiveOrganisation();
      const completion = new fromActons.LoadActiveOrganisationFail(new Error());
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadActiveOrganisations$).toBeObservable(expected);
    });
  });

  describe('loadPbaAccountDetails$', () => {
    it('should return LoadPbaAccountDetailsSuccess', () => {
      const payload0 = LoadPbaAccuntsObj;
      getAccountDetailsServiceMock.getAccountDetails.and.returnValue(of(payload0));
      const action = new fromActons.LoadPbaAccountsDetails({pbas: 'PBA0088487', orgId: '12345'});
      const completion = new fromActons.LoadPbaAccountDetailsSuccess({orgId: '12345', data: payload0});
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadPbaAccountDetails$).toBeObservable(expected);
    });
  });


  describe('addReviewOrganisations$', () => {
    it('should addReviewOrganisations  action', () => {
      const action = new fromActons.AddReviewOrganisations({} as OrganisationVM);
      const completion = new Go({
        path: ['/approve-organisations']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.addReviewOrganisations$).toBeObservable(expected);
    });
  });

  describe('approvePendingOrgsSuccess$', () => {
    it('should approvePendingOrgsSuccess  action', () => {
      const action = new fromActons.ApprovePendingOrganisationsSuccess({} as OrganisationVM);
      const completion = new Go({
        path: ['/approve-organisations-success']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.approvePendingOrgsSuccess$).toBeObservable(expected);
    });
  });
});
