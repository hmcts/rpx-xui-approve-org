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
import { Organisation } from 'src/org-manager/models/organisation';

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
      const organisation: Organisation = {
        organisationIdentifier: '',
        contactInformation: [{
          addressLine1: '',
          townCity: 'string',
          county: 'string',
          dxAddress: [{
            dxNumber: 'string',
            dxExchange: 'string',
          }],
        }],
        superUser: {
          userIdentifier: '',
          firstName: 'string',
          lastName: 'string;',
          email: 'string',
        },
        status: 'string;',
        name: 'string;',
        paymentAccount: [{}]
      };
      const payload = [organisation];
      const result = effects.mapOrganisations([organisation]);
      OrganisationServiceMock.fetchOrganisations.and.returnValue(of(payload));
      const action = new LoadOrganisation();
      const completion = new LoadOrganisationSuccess(result);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadOrganisations$).toBeObservable(expected);
    });
  });

  describe('loadOrganisations$ error', () => {
    it('should return LoadOrganisationsFail', () => {
      OrganisationServiceMock.fetchOrganisations.and.returnValue(throwError(new Error()));
      const action = new LoadOrganisation();
      const completion = new LoadOrganisationFail(new Error());
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadOrganisations$).toBeObservable(expected);
    });
  });

});
