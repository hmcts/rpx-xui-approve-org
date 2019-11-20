import { initialState, reducer } from './organisation.reducer';
import { LoadPendingOrganisationsSuccess, AddReviewOrganisations, LoadPendingOrganisations } from '../actions';
import * as fromPendingOrganisation from './organisation.reducer';
import { PendingOrganisationsMockCollection1, PendingOrganisationsMockSummaryCollection1 } from '../../mock/pending-organisation.mock';
import { Organisation, OrganisationVM, OrganisationSummary } from 'src/org-manager/models/organisation';


describe('PendingOrganisationsReducer', () => {

  const PendingOrganisationsMock: OrganisationVM[] = PendingOrganisationsMockCollection1;

  const PendingOrganisationsMockSummary: OrganisationSummary[] = PendingOrganisationsMockSummaryCollection1;

  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const state = reducer(undefined, action);
      expect(state).toEqual(initialState);
    });
  });

  describe('LOAD_PENDING_ORGANISATION action', () => {
    it('should return the initial state.pendingOrganisations', () => {

      const action = new LoadPendingOrganisations();
      const state = reducer(initialState, action);
      expect(state.reviewedOrganisations).toEqual(initialState.pendingOrganisations);
    });

  });

  xdescribe('LOAD_PENDING_ORGANISATION_SUCCESS action', () => {
    it('should update the state.pendingOrganisations', () => {

      const action = new LoadPendingOrganisationsSuccess(PendingOrganisationsMock);
      const state = reducer(initialState, action);
      expect(state.pendingOrganisations).toEqual(PendingOrganisationsMockSummary);
    });

  });

  describe('ADD_REVIEW_ORGANISATIONS action', () => {
    it('should update the state.orgForReview', () => {

      const action = new AddReviewOrganisations(PendingOrganisationsMock);
      const state = reducer(initialState, action);
      expect(state.reviewedOrganisations).toEqual(PendingOrganisationsMock);
    });

  });

  describe('exports', () => {
    it('should return state.pendingOrganisations', () => {
      expect(fromPendingOrganisation.getPendingOrganisations(initialState)).toEqual([]);
      expect();
    });

    describe('getPendingOrganisationsLoading export', () => {
      it('should return state.loading', () => {
        expect(fromPendingOrganisation.getPendingOrganisationsLoading(initialState)).toEqual(false);
      });
    });

    describe('getPendingOrganisationsLoaded export', () => {
      it('should return state.loaded', () => {
        expect(fromPendingOrganisation.getPendingOrganisationsLoaded(initialState)).toEqual(false);
      });
    });

    describe('getReviewedOrganisations export', () => {
      it('should return state.loaded', () => {
        expect(fromPendingOrganisation.getReviewedOrganisations(initialState)).toEqual([]);
      });
    });
  });
});
