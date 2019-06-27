import { initialState, reducer } from './single-org-pending.reducer';
import { LoadSinglePendingOrgSuccess } from '../actions';
import { SingleOrgSummary } from '../../../org-manager/models/single-org-summary';
import * as fromSingleOrgPending from './single-org-pending.reducer';
import { SingleOrgSummaryMock } from '../../../org-manager/mock/pending-organisation.mock';

  describe('SingleOrgPendingReducer', () => {
    describe('undefined action', () => {
      it('should return the default state', () => {
        const action = {} as any;
        const state = reducer(undefined, action);
        expect(state).toEqual(initialState);
      });
    });
});

describe('LOAD_SINGLE_PENDING_SUCCESS action', () => {
    it('should update the state.data', () => {
      const payload: SingleOrgSummary = SingleOrgSummaryMock;
      const action = new LoadSinglePendingOrgSuccess(payload);
      const state = reducer(initialState, action);
      expect(state.data).toEqual(payload);
    });
  });

  describe('getSinglePendingOrganisation export', () => {
    it('should return state.organisation', () => {
      expect(fromSingleOrgPending.getSingleOrgOverview(initialState)).toEqual({});
    });
  });

  describe('getSinglePendingOrgLoading export', () => {
    it('should return state.loading', () => {
      expect(fromSingleOrgPending.getSingleOrgOverviewLoading(initialState)).toEqual(false);
    });
  });

  describe('getSinglePendingOrgLoaded export', () => {
    it('should return state.loaded', () => {
      expect(fromSingleOrgPending.getSingleOrgOverviewLoaded(initialState)).toEqual(false);
    });
  });
