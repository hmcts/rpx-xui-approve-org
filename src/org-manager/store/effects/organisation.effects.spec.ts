import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { LoggerService } from '../../../app/services/logger.service';
import { AddGlobalError, Go } from '../../../app/store';
import {
  LoadPbaAccountsObj,
  PendingOrganisationsMockCollection1,
  PendingOrganisationsMockCollectionObj
} from '../../mock/pending-organisation.mock';
import { ErrorReport } from '../../models/errorReport.model';
import { OrganisationVM } from '../../models/organisation';
import { OrganisationService, PbaAccountDetails, PendingOrganisationService } from '../../services';
import * as fromActions from '../actions/organisations.actions';
import { OrganisationEffects } from './organisation.effects';

export class LoggerServiceMock {
  public error(err) {
    return err;
  }
}

describe('Organisation Effects', () => {
  let actions$;
  let effects: OrganisationEffects;
  const pendingOrganisationServiceMock = jasmine.createSpyObj('PendingOrganisationService', [
    'fetchPendingOrganisations',
    'approvePendingOrganisations',
    'deletePendingOrganisations'
  ]);
  const organisationServiceMock = jasmine.createSpyObj('OrganisationService', [
    'fetchOrganisations',
    'getOrganisationUsers',
    'deleteOrganisation',
    'getOrganisationDeletableStatus'
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
        OrganisationEffects,
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

  xdescribe('approvePendingOrganisations$', () => {
    it('should return a collection from approvePendingOrgs$ - ApprovePendingOrganisationsSuccess', () => {
      pendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(of(true));
      const action = new fromActions.ApprovePendingOrganisations(payload[0]);
      const completion = new fromActions.ApprovePendingOrganisationsSuccess({} as OrganisationVM);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.approvePendingOrgs$).toBeObservable(expected);

      const successAction = new fromActions.ApprovePendingOrganisationsSuccess({} as OrganisationVM);
      const successCompletion = new Go({ path: ['/approve-organisations'] });
      actions$ = hot('-a', { a: successAction });
      const successExpected = cold('--b', { b: successCompletion });
      expect(effects.approvePendingOrgsSuccess$).toBeObservable(successExpected);
    });
  });

  describe('approvePendingOrganisations$ error', () => {
    it('should return ApprovePendingOrganisationsOrganisationsFail', () => {
      pendingOrganisationServiceMock.approvePendingOrganisations.and.returnValue(throwError(''));
      const action = new fromActions.ApprovePendingOrganisations(payload[0]);
      const completion = new fromActions.DisplayErrorMessageOrganisations('');
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.approvePendingOrgs$).toBeObservable(expected);
    });
  });

  describe('loadActiveOrganisations$ error', () => {
    it('should return LoadOrganisationsFail', () => {
      organisationServiceMock.fetchOrganisations.and.returnValue(throwError(new Error()));
      const action = new fromActions.LoadActiveOrganisation();
      const completion = new fromActions.LoadActiveOrganisationFail(new Error());
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadActiveOrganisations$).toBeObservable(expected);
    });
  });

  describe('loadPbaAccountDetails$', () => {
    it('should return LoadPbaAccountDetailsSuccess', () => {
      const payload0 = LoadPbaAccountsObj;
      getAccountDetailsServiceMock.getAccountDetails.and.returnValue(of(payload0));
      const action = new fromActions.LoadPbaAccountsDetails({pbas: 'PBA0088487', orgId: '12345'});
      const completion = new fromActions.LoadPbaAccountDetailsSuccess({orgId: '12345', data: payload0});
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadPbaAccountDetails$).toBeObservable(expected);
    });
  });

  describe('addReviewOrganisations$', () => {
    it('should addReviewOrganisations action', () => {
      const action = new fromActions.AddReviewOrganisations({} as OrganisationVM);
      const completion = new Go({
        path: ['/approve-organisations']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.addReviewOrganisations$).toBeObservable(expected);
    });
  });

  describe('approvePendingOrgsSuccess$', () => {
    it('should approvePendingOrgsSuccess action', () => {
      const action = new fromActions.ApprovePendingOrganisationsSuccess({} as OrganisationVM);
      const completion = new Go({
        path: ['/approve-organisations-success']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.approvePendingOrgsSuccess$).toBeObservable(expected);
    });
  });

  describe('deletePendingOrg$', () => {
    it('should return a success action', () => {
      pendingOrganisationServiceMock.deletePendingOrganisations.and.returnValue(of(true));
      const action = new fromActions.DeletePendingOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new fromActions.DeletePendingOrganisationSuccess(PendingOrganisationsMockCollectionObj);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deletePendingOrg$).toBeObservable(expected);
    });

    it('should return a failure action when the HTTP status is 400', () => {
      pendingOrganisationServiceMock.deletePendingOrganisations.and.returnValue(throwError({
        error: {
          apiStatusCode: 400,
        } as ErrorReport
      }));
      const action = new fromActions.DeletePendingOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new AddGlobalError({
        header: 'Sorry, there is a problem with the organisation',
        errors: [{
          bodyText: 'Contact your support teams to delete this pending organisation.',
          urlText: null,
          url: null
        }]
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deletePendingOrg$).toBeObservable(expected);
    });

    it('should return a failure action when the HTTP status is 404', () => {
      pendingOrganisationServiceMock.deletePendingOrganisations.and.returnValue(throwError({
        error: {
          apiStatusCode: 404,
        } as ErrorReport
      }));
      const action = new fromActions.DeletePendingOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new AddGlobalError({
        header: 'Sorry, there is a problem with the organisation',
        errors: [{
          bodyText: 'Contact your support teams to delete this pending organisation.',
          urlText: null,
          url: null
        }]
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deletePendingOrg$).toBeObservable(expected);
    });

    it('should return a failure action when the HTTP status is 403', () => {
      pendingOrganisationServiceMock.deletePendingOrganisations.and.returnValue(throwError({
        error: {
          apiStatusCode: 403,
        } as ErrorReport
      }));
      const action = new fromActions.DeletePendingOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new AddGlobalError({
        header: 'Sorry, you\'re not authorised to perform this action',
        errors: null
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deletePendingOrg$).toBeObservable(expected);
    });

    it('should return a failure action when the HTTP status is 500', () => {
      pendingOrganisationServiceMock.deletePendingOrganisations.and.returnValue(throwError({
        error: {
          apiStatusCode: 500,
        } as ErrorReport
      }));
      const action = new fromActions.DeletePendingOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new AddGlobalError({
        header: 'Sorry, there is a problem with the service',
        errors: [{
          bodyText: 'Try again later.',
          urlText: null,
          url: null
        }]
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deletePendingOrg$).toBeObservable(expected);
    });
  });

  describe('deletePendingOrgSuccess$', () => {
    it('should return an action to navigate to the "Delete Organisation" success page', () => {
      const action = new fromActions.DeletePendingOrganisationSuccess({} as OrganisationVM);
      const completion = new Go({
        path: ['/delete-organisation-success']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deletePendingOrgSuccess$).toBeObservable(expected);
    });
  });

  describe('deletePendingOrgFail$', () => {
    it('should return an action to navigate to the "Service Down" page for displaying errors', () => {
      const action = new fromActions.DeletePendingOrganisationFail();
      const completion = new Go({
        path: ['/service-down']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deletePendingOrgFail$).toBeObservable(expected);
    });
  });

  describe('deleteOrganisation$', () => {
    it('should return a success action', () => {
      organisationServiceMock.deleteOrganisation.and.returnValue(of(true));
      const action = new fromActions.DeleteOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new fromActions.DeleteOrganisationSuccess(PendingOrganisationsMockCollectionObj);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deleteOrganisation$).toBeObservable(expected);
    });

    it('should return a failure action when the HTTP status is 400', () => {
      organisationServiceMock.deleteOrganisation.and.returnValue(throwError({
        error: {
          apiStatusCode: 400,
        } as ErrorReport
      }));
      const action = new fromActions.DeleteOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new AddGlobalError({
        header: 'Sorry, there is a problem with the organisation',
        errors: [{
          bodyText: 'Contact your support teams to delete this active organisation.',
          urlText: null,
          url: null
        }]
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deleteOrganisation$).toBeObservable(expected);
    });

    it('should return a failure action when the HTTP status is 404', () => {
      organisationServiceMock.deleteOrganisation.and.returnValue(throwError({
        error: {
          apiStatusCode: 404,
        } as ErrorReport
      }));
      const action = new fromActions.DeleteOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new AddGlobalError({
        header: 'Sorry, there is a problem with the organisation',
        errors: [{
          bodyText: 'Contact your support teams to delete this active organisation.',
          urlText: null,
          url: null
        }]
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deleteOrganisation$).toBeObservable(expected);
    });

    it('should return a failure action when the HTTP status is 403', () => {
      organisationServiceMock.deleteOrganisation.and.returnValue(throwError({
        error: {
          apiStatusCode: 403,
        } as ErrorReport
      }));
      const action = new fromActions.DeleteOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new AddGlobalError({
        header: 'Sorry, you\'re not authorised to perform this action',
        errors: null
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deleteOrganisation$).toBeObservable(expected);
    });

    it('should return a failure action when the HTTP status is 500', () => {
      organisationServiceMock.deleteOrganisation.and.returnValue(throwError({
        error: {
          apiStatusCode: 500,
        } as ErrorReport
      }));
      const action = new fromActions.DeleteOrganisation(PendingOrganisationsMockCollectionObj);
      const completion = new AddGlobalError({
        header: 'Sorry, there is a problem with the service',
        errors: [{
          bodyText: 'Try again later.',
          urlText: null,
          url: null
        }]
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deleteOrganisation$).toBeObservable(expected);
    });
  });

  describe('deleteOrganisationSuccess$', () => {
    it('should return an action to navigate to the "Delete Organisation" success page', () => {
      const action = new fromActions.DeleteOrganisationSuccess({} as OrganisationVM);
      const completion = new Go({
        path: ['/delete-organisation-success']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.deleteOrganisationSuccess$).toBeObservable(expected);
    });
  });

  describe('getOrganisationDeletableStatus$', () => {
    it('should return a success action', () => {
      const orgDeletableResponse = {
        organisationDeletable: false
      };
      organisationServiceMock.getOrganisationDeletableStatus.and.returnValue(of(orgDeletableResponse));
      const action = new fromActions.GetOrganisationDeletableStatus('abc123');
      const completion = new fromActions.GetOrganisationDeletableStatusSuccess(false);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.getOrganisationDeletableStatus$).toBeObservable(expected);
    });

    it('should return a failure action when there is an error', () => {
      organisationServiceMock.getOrganisationDeletableStatus.and.returnValue(throwError({
        error: {
          apiStatusCode: 500,
        } as ErrorReport
      }));
      const action = new fromActions.GetOrganisationDeletableStatus('abc123');
      const completion = new AddGlobalError({
        header: 'Sorry, there is a problem with the service',
        errors: [{
          bodyText: 'Try again later.',
          urlText: null,
          url: null
        }]
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.getOrganisationDeletableStatus$).toBeObservable(expected);
    });
  });
});
