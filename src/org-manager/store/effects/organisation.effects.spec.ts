import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { of, throwError } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromOrganisationEffects from './organisation.effects';
import { OrganisationEffects } from './organisation.effects';
import { LoadOrganisation, LoadOrganisationFail } from '../actions/organisation.actions';
import { LoadOrganisationSuccess } from '../actions';
import { OrganisationService } from 'src/org-manager/services';

describe('Organisation Effects', () => {
  let actions$;
  let effects: OrganisationEffects;
  const OrganisationServiceMock = jasmine.createSpyObj('OrganisationService', [
    'fetchOrganisations',
  ]);
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
          {
            provide: OrganisationService,
            useValue: OrganisationServiceMock,
          },
          fromOrganisationEffects.OrganisationEffects,
          provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get(OrganisationEffects);

  });
  describe('loadOrganisationss$', () => {
    it('should return a collection from loadOrganisations$ - LoadOrganisationsSuccess', () => {
      const payload = [{payload: 'something'}];
      OrganisationServiceMock.fetchOrganisations.and.returnValue(of(payload));
      const action = new LoadOrganisation();
      const completion = new LoadOrganisationSuccess([{payload: 'something'}]);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadOrganisations$).toBeObservable(expected);
    });
  });

  describe('loadOrganisations$ error', () => {
    it('should return LoadOrganisationsFail', () => {
      OrganisationServiceMock.fetchOrganisations.and.returnValue(throwError(new Error()));
      const action = new LoadOrganisation();
      const completion = new LoadOrganisationFail(new Error);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadOrganisations$).toBeObservable(expected);
    });
  });

});