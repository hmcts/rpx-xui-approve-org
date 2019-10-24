import { OrganisationSummary, OrganisationVM } from 'src/org-manager/models/organisation';
import { LoadOrganisationSuccess } from '../actions';
import * as fromOrganisation from './organisation.reducer';

describe('OrganisationsReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const state = fromOrganisation.reducer( undefined, action);
      expect(state).toEqual(fromOrganisation.initialState);
    });
  });

  describe('LOAD_ORGANISATION_SUCCESS action', () => {
    it('should update the state.activeOrg', () => {
      const organisationsMock: OrganisationVM[] = [
        {
          name: 'Speake Limited',
          addressLine1: '72 Guild Street',
          addressLine2: '',
          townCity: 'London',
          county: '',
          pbaNumber: ['12345678'],
          admin: 'Matt Speake',
          status: 'ACTIVE',
          view: 'View',
          organisationId: '12345678',
          adminEmail: 'matt@speake.com',
          dxNumber: ['something']
        }
      ];
      const organisationsMockSummary: OrganisationSummary[] = [
        {
          name: 'Speake Limited',
          addressLine1: '72 Guild Street',
          addressLine2: '',
          townCity: 'London',
          county: '',
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
      const action = new LoadOrganisationSuccess(organisationsMock);
      const state = fromOrganisation.reducer(fromOrganisation.initialState, action);
      expect(state.organisations).toEqual(organisationsMockSummary);
    });
  });

  describe('getOrganisations export', () => {
    it('should return state.activeOrg', () => {
      expect(fromOrganisation.getOrganisations(fromOrganisation.initialState)).toEqual(null);
      expect();
    });
  });

  describe('getOrganisationsLoading export', () => {
    it('should return state.loading', () => {
      expect(fromOrganisation.getOrganisationsLoading(fromOrganisation.initialState)).toEqual(false);
    });
  });

  describe('getOrganisationsLoaded export', () => {
    it('should return state.loaded', () => {
      expect(fromOrganisation.getOrganisationsLoaded(fromOrganisation.initialState)).toEqual(false);
    });
  });
});

