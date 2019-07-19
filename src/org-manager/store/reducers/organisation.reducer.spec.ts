import { initialState, reducer } from './organisation.reducer';
import { LoadOrganisationSuccess } from '../actions';
import { Organisation, OrganisationSummary, OrganisationVM } from 'src/org-manager/models/organisation';
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
    it('should update the state.activeOrg', () => {
      const OrganisationsMock: OrganisationVM[] = [
        {
          name: 'Speake Limited',
          address: '72 Guild Street, London, SE23 6FH',
          pbaNumber: ['12345678'],
          admin: 'Matt Speake',
          status: 'ACTIVE',
          view: 'View',
          organisationId: '12345678',
          adminEmail: 'matt@speake.com',
          dxNumber: ['something']
        }
      ];
      const OrganisationsMockSummary: OrganisationSummary[] = [
        {
          name: 'Speake Limited',
          address: '72 Guild Street, London, SE23 6FH',
          pbaNumber: ['12345678'],
          admin: 'Matt Speake',
          status: 'ACTIVE',
          view: 'View',
          organisationId: '12345678',
          adminEmail: 'matt@speake.com',
          routerLink: '/organisations/organisation/12345678/',
          dxNumber: ['something']
        }
      ];
      const action = new LoadOrganisationSuccess(OrganisationsMock);
      const state = reducer(initialState, action);
      expect(state.organisations).toEqual(OrganisationsMockSummary);
    });
  });

  describe('getOrganisations export', () => {
    it('should return state.activeOrg', () => {
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

