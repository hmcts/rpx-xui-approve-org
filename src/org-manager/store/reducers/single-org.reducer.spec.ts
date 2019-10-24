import { OrganisationVM } from 'src/org-manager/models/organisation';
import { LoadSingleOrgSuccess } from '../actions';
import * as fromSingleOrg from './single-org.reducer';

describe('SingleOrgReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const state = fromSingleOrg.reducer(undefined, action);
      expect(state).toEqual(fromSingleOrg.initialState);
    });
  });

  describe('LOAD_SINGLE_ORG_SUCCESS action', () => {
    it('should update the state.activeOrg', () => {
      const payload: OrganisationVM = {
        pbaNumber: ['SU2DSCSA'],
        status: 'ACTIVE',
        name: 'Speake Limited',
        addressLine1: '72 Guild Street, London, SE23 6FH',
        addressLine2: '',
        townCity: '',
        county: '',
        dxNumber: ['12345567'],
        admin: 'Matt Speake',
        adminEmail: 'Matt@ape.com',
        view: '',
        sraId: '',
        organisationId: '1234567'
      };
      const action = new LoadSingleOrgSuccess(payload);
      const state = fromSingleOrg.reducer(fromSingleOrg.initialState, action);
      expect(state.data).toEqual(payload);
    });
  });

  describe('getSingleOrganisation export', () => {
    it('should return state.organisation', () => {
      expect(fromSingleOrg.getSingleOrgOverview(fromSingleOrg.initialState)).toEqual({});
    });
  });

  describe('getSingleOrgLoading export', () => {
    it('should return state.loading', () => {
      expect(fromSingleOrg.getSingleOrgOverviewLoading(fromSingleOrg.initialState)).toEqual(false);
    });
  });

  describe('getSingleOrgLoaded export', () => {
    it('should return state.loaded', () => {
      expect(fromSingleOrg.getSingleOrgOverviewLoaded(fromSingleOrg.initialState)).toEqual(false);
    });
  });
});
