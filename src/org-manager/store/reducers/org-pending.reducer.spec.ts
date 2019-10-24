import { OrganisationSummary, OrganisationVM } from 'src/org-manager/models/organisation';
import { pendingOrganisationsMockCollection1, pendingOrganisationsMockSummaryCollection1 } from '../../mock/pending-organisation.mock';
import { AddReviewOrganisations, LoadPendingOrganisations, LoadPendingOrganisationsSuccess } from '../actions';
import * as fromPendingOrganisation from './org-pending.reducer';

describe('PendingOrganisationsReducer', () => {
  const pendingOrganisationsMock: OrganisationVM[] = pendingOrganisationsMockCollection1;
  const pendingOrganisationsMockSummary: OrganisationSummary[] = pendingOrganisationsMockSummaryCollection1;

  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const state = fromPendingOrganisation.reducer(undefined, action);
      expect(state).toEqual(fromPendingOrganisation.initialState);
    });
  });

  describe('LOAD_PENDING_ORGANISATION action', () => {
    it('should return the initial state.pendingOrganisations', () => {

      const action = new LoadPendingOrganisations();
      const state = fromPendingOrganisation.reducer(fromPendingOrganisation.initialState, action);
      expect(state.reviewedOrganisations).toEqual(fromPendingOrganisation.initialState.pendingOrganisations);
    });

  });

  xdescribe('LOAD_PENDING_ORGANISATION_SUCCESS action', () => {
    it('should update the state.pendingOrganisations', () => {

      const action = new LoadPendingOrganisationsSuccess(pendingOrganisationsMock);
      const state = fromPendingOrganisation.reducer(fromPendingOrganisation.initialState, action);
      expect(state.pendingOrganisations).toEqual(pendingOrganisationsMockSummary);
    });

  });

  describe('ADD_REVIEW_ORGANISATIONS action', () => {
    it('should update the state.reviewedOrganisations', () => {

      const action = new AddReviewOrganisations(pendingOrganisationsMock);
      const state = fromPendingOrganisation.reducer(fromPendingOrganisation.initialState, action);
      expect(state.reviewedOrganisations).toEqual(pendingOrganisationsMock);
    });

  });

  describe('exports', () => {
    it('should return state.pendingOrganisations', () => {
      expect(fromPendingOrganisation.getPendingOrganisations(fromPendingOrganisation.initialState)).toEqual([]);
      expect();
    });

    describe('getPendingOrganisationsLoading export', () => {
      it('should return state.loading', () => {
        expect(fromPendingOrganisation.getPendingOrganisationsLoading(fromPendingOrganisation.initialState)).toEqual(false);
      });
    });

    describe('getPendingOrganisationsLoaded export', () => {
      it('should return state.loaded', () => {
        expect(fromPendingOrganisation.getPendingOrganisationsLoaded(fromPendingOrganisation.initialState)).toEqual(false);
      });
    });

    describe('getReviewedOrganisations export', () => {
      it('should return state.loaded', () => {
        expect(fromPendingOrganisation.getReviewedOrganisations(fromPendingOrganisation.initialState)).toEqual([]);
      });
    });
  });
});
