import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromSingleOrgPendingEffects from './single-org-pending.effects';
import { SingleOrgPendingEffects } from './single-org-pending.effects';
import { LoadSinglePendingOrg, LoadSinglePendingOrgFail } from '../actions/single-org-pending.actions';
import { LoadSinglePendingOrgSuccess } from '../actions';
import { PendingOrganisationService } from '../../../org-manager/services';
import { SingleOrgSummary } from '../../../org-manager/models/single-org-summary';
import { SingleOrgSummaryMock } from '../../../org-manager/mock/pending-organisation.mock';
import { LoggerService } from 'src/app/services/logger.service';

export class LoggerServiceMock {
  error(err) {
    return err;
  }
}

describe('Single pending organisation Effects', () => {
  let actions$;
  let effects: SingleOrgPendingEffects;
  const PendingOrganisationServiceMock = jasmine.createSpyObj('PendingOrganisationService', [
    'getSingleOrganisation',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: PendingOrganisationService,
          useValue: PendingOrganisationServiceMock,
        },
        fromSingleOrgPendingEffects.SingleOrgPendingEffects,
        provideMockActions(() => actions$),
        {
          provide: LoggerService,
          useClass: LoggerServiceMock
        }
      ]
    });
    effects = TestBed.get(SingleOrgPendingEffects);

  });
  describe('loadSingleOrg$', () => {
    it('should return a collection from loadSingleOrg$ - LoadSingleOrgSuccess', () => {
      const payload: SingleOrgSummary = SingleOrgSummaryMock;

      PendingOrganisationServiceMock.getSingleOrganisation.and.returnValue(of(payload));
      const action = new LoadSinglePendingOrg({});
      const completion = new LoadSinglePendingOrgSuccess(payload[0]);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadSingleOrg$).toBeObservable(expected);
    });

    describe('loadSingleOrg$ error', () => {
      it('should return LoadSingleOrgFail', () => {
        PendingOrganisationServiceMock.getSingleOrganisation.and.returnValue(throwError(new Error()));
        const action = new LoadSinglePendingOrg({});
        const completion = new LoadSinglePendingOrgFail(new Error());
        actions$ = hot('-a', { a: action });
        const expected = cold('-b', { b: completion });
        expect(effects.loadSingleOrg$).toBeObservable(expected);
      });
    });
  });
});

