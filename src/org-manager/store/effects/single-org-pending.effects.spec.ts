import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { LoggerService } from 'src/app/services/logger.service';
import { singleOrgSummaryMock } from '../../../org-manager/mock/pending-organisation.mock';
import { SingleOrgSummary } from '../../../org-manager/models/single-org-summary';
import { PendingOrganisationService } from '../../../org-manager/services';
import { LoadSinglePendingOrgSuccess } from '../actions';
import { LoadSinglePendingOrg, LoadSinglePendingOrgFail } from '../actions/single-org-pending.actions';
import * as fromSingleOrgPendingEffects from './single-org-pending.effects';
import { SingleOrgPendingEffects } from './single-org-pending.effects';

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
      const payload: SingleOrgSummary = singleOrgSummaryMock;

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

