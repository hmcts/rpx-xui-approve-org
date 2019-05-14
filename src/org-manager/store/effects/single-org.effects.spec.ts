import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromSingleOrgEffects from './single-org.effects';
import { SingleOrgEffects } from './single-org.effects';
import { LoadSingleOrg, LoadSingleOrgFail} from '../actions/single-org.actions';
import { LoadSingleOrgSuccess } from '../actions';
import { OrganisationService } from 'src/org-manager/services';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';

describe('Single organisation Effects', () => {
  let actions$;
  let effects: SingleOrgEffects;
  const OrganisationServiceMock = jasmine.createSpyObj('OrganisationService', [
    'getSingleOrganisation',
  ]);
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
          {
            provide: OrganisationService,
            useValue: OrganisationServiceMock,
          },
          fromSingleOrgEffects.SingleOrgEffects,
          provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get(SingleOrgEffects);

  });
  describe('loadSingleOrg$', () => {
    it('should return a collection from loadSingleOrg$ - LoadSingleOrgSuccess', () => {
      const payload: SingleOrgSummary = {
        status: 'Active',
        effective_date: '22/10/2022',
        dx_exchange: '',
        name: 'Speak Limited',
        address: '72 Guild Street, London, SE23 6FH',
        pbaNumber: 'SU2DSCSA',
        dxNumber: '12345567',
        dxExchange: '7654321',
        admin: 'Matt Speak'
    };

      OrganisationServiceMock.getSingleOrganisation.and.returnValue(of(payload));
      const action = new LoadSingleOrg({});
      const completion = new LoadSingleOrgSuccess(payload[0]);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadSingleOrg$).toBeObservable(expected);
    });
  });

  describe('loadSingleOrg$ error', () => {
    it('should return LoadSingleOrgFail', () => {
      OrganisationServiceMock.getSingleOrganisation.and.returnValue(throwError(new Error()));
      const action = new LoadSingleOrg({});
      const completion = new LoadSingleOrgFail(new Error);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadSingleOrg$).toBeObservable(expected);
    });
  });

});
