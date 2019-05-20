import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromPendingOrganisationEffects from './org-pending.effects';
import { PendingOrgffects, PendingOrgEffects } from './org-pending.effects';
import { LoadPendingOrganisations } from '../actions/org-pending.actions';
import { LoadPendingOrganisationsSuccess, LoadPendingOrganisationsFail } from '../actions';
import { PendingOrganisationService } from 'src/org-pending/services';
import { PendingOrganisation } from '../../models/pending-organisation'

describe('Pending Organisation Effects', () => {
  let actions$;
  let effects: PendingOrgEffects;
  const PendingOrganisationServiceMock = jasmine.createSpyObj('PendingOrganisationService', [
    'fetchPendingOrganisations',
  ]);
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
          {
            provide: PendingOrganisationService,
            useValue: PendingOrganisationServiceMock,
          },
          fromPendingOrganisationEffects.PendingOrgEffects,
          provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get(PendingOrgEffects);

  });


describe('loadPendingOrganisationss$', () => {
    it('should return a collection from loadPendingOrgs$ - LoadPendingOrganisationsSuccess', () => {
      const payload: PendingOrganisation[] =   [{
        name: 'Glen Byrne',
        organisationId: 'Byrne Limited',
        address: '13 Berryfield drive, Finglas',
        pbaNumber: '101010',
        admin: 'Glen Byrne',
        status: 'PENDING',
        view: 'View',
        id: '2424242',
        email: 'glen@byrne.com'
      }]

      PendingOrganisationServiceMock.fetchPendingOrganisations.and.returnValue(of(payload));
      const action = new LoadPendingOrganisations();
      const completion = new LoadPendingOrganisationsSuccess(payload);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadPendingOrgs$).toBeObservable(expected);
    });
  });

  describe('loadPendingOrgs$ error', () => {
    it('should return LoadPendingOrganisationsFail', () => {
      PendingOrganisationServiceMock.fetchPendingOrganisations.and.returnValue(throwError(new Error()));
      const action = new LoadPendingOrganisations();
      const completion = new LoadPendingOrganisationsFail(new Error);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadPendingOrgs$).toBeObservable(expected);
    });
  });

});