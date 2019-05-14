import { initialState, reducer } from './organisation.reducer';
import { LoadOrganisationSuccess } from '../actions';
import { Organisation, OrganisationSummary } from 'src/org-manager/models/organisation';
import * as fromOrganisation from './organisation.reducer';

describe('OrganisationsReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const state = reducer( undefined, action);
      expect(state).toEqual(initialState);
    });
  });

  describe('LOAD_ORGANISATION_SUCCESS action', () => {
    it('should update the state.organisations', () => {
      const OrganisationsMock: Organisation[] = [
        {
          organisationId: 'Speake Limited',
          address: '72 Guild Street, London, SE23 6FH',
          pbaNumber: 'SU2DSCSA',
          admin: 'Matt Speake',
          status: 'ACTIVE',
          view: 'View',
          id: '12345678',
          email: 'matt@speake.com'
        }
      ];
      const OrganisationsMockSummary: OrganisationSummary[] = [
        {
          organisationId: 'Speake Limited',
          address: '72 Guild Street, London, SE23 6FH',
          pbaNumber: 'SU2DSCSA',
          admin: 'Matt Speake',
          status: 'ACTIVE',
          view: 'View',
          id: '12345678',
          email: 'matt@speake.com',
          routerLink: '/organisations/organisation/SU2DSCSA/'
        }
      ];
      const action = new LoadOrganisationSuccess(OrganisationsMock);
      const state = reducer(initialState, action);
      expect(state.organisations).toEqual(OrganisationsMockSummary);
    });
  });

  describe('getOrganisations export', () => {
    it('should return state.organisations', () => {
      expect(fromOrganisation.getOrganisations(initialState)).toEqual(null);
      expect();
    });
  });

  describe('getOrganisationsLoading export', () => {
    it('should return state.loading', () => {
      expect(fromOrganisation.getOrganisationsLoading(initialState)).toEqual(false);
    });
  });

  describe('getOrganisationsLoaded export', () => {
    it('should return state.loaded', () => {
      expect(fromOrganisation.getOrganisationsLoaded(initialState)).toEqual(false);
    });
  });
});

