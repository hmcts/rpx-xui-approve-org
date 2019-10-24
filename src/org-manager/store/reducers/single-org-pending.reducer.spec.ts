import { singleOrgSummaryMock } from '../../../org-manager/mock/pending-organisation.mock';
import { SingleOrgSummary } from '../../../org-manager/models/single-org-summary';
import { LoadSinglePendingOrgSuccess } from '../actions';
import * as fromSingleOrgPending from './single-org-pending.reducer';

describe('SingleOrgPendingReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const state = fromSingleOrgPending.reducer(undefined, action);
      expect(state).toEqual(fromSingleOrgPending.initialState);
    });
  });
});

describe('LOAD_SINGLE_PENDING_SUCCESS action', () => {
  it('should update the state.data', () => {
    const payload: SingleOrgSummary = singleOrgSummaryMock;
    const action = new LoadSinglePendingOrgSuccess(payload);
    const state = fromSingleOrgPending.reducer(fromSingleOrgPending.initialState, action);
    expect(state.data).toEqual(payload);
  });
});

describe('getSinglePendingOrganisation export', () => {
  it('should return state.organisation', () => {
    expect(fromSingleOrgPending.getSingleOrgOverview(fromSingleOrgPending.initialState)).toEqual({});
  });
});

describe('getSinglePendingOrgLoading export', () => {
  it('should return state.loading', () => {
    expect(fromSingleOrgPending.getSingleOrgOverviewLoading(fromSingleOrgPending.initialState)).toEqual(false);
  });
});

describe('getSinglePendingOrgLoaded export', () => {
  it('should return state.loaded', () => {
    expect(fromSingleOrgPending.getSingleOrgOverviewLoaded(fromSingleOrgPending.initialState)).toEqual(false);
  });
});
