import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromSingleOrgPendingEffects from './single-org-pending.effects';
import { SingleOrgEffects } from './single-org-pending.effects';
import { LoadSingleOrg, LoadSingleOrgFail } from '../actions/single-org-pending.actions';
import { LoadSingleOrgSuccess } from '../actions';
import { PendingOrganisationService } from '../../../org-pending/services';
import { SingleOrgSummary } from '../../../org-manager/models/single-org-summary';
import { SingleOrgSummaryMock } from '../../../org-pending/mock/pending-organisation.mock';

describe('Single pending organisation Effects', () => {
  let actions$;
  let effects: SingleOrgEffects;
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
        fromSingleOrgPendingEffects.SingleOrgEffects,
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.get(SingleOrgEffects);

  });
  describe('loadSingleOrg$', () => {
    it('should return a collection from loadSingleOrg$ - LoadSingleOrgSuccess', () => {
      const payload: SingleOrgSummary = SingleOrgSummaryMock;

      PendingOrganisationServiceMock.getSingleOrganisation.and.returnValue(of(payload));
      const action = new LoadSingleOrg({});
      const completion = new LoadSingleOrgSuccess(payload[0]);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadSingleOrg$).toBeObservable(expected);
    });

    describe('loadSingleOrg$ error', () => {
      it('should return LoadSingleOrgFail', () => {
        PendingOrganisationServiceMock.getSingleOrganisation.and.returnValue(throwError(new Error()));
        const action = new LoadSingleOrg({});
        const completion = new LoadSingleOrgFail(new Error);
        actions$ = hot('-a', { a: action });
        const expected = cold('-b', { b: completion });
        expect(effects.loadSingleOrg$).toBeObservable(expected);
      });
    });
  });
});

