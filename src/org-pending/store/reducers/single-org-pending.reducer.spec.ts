import { initialState, reducer } from './single-org-pending.reducer';
import { LoadSingleOrgSuccess } from '../actions';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import * as fromSingleOrgPending from './single-org-pending.reducer';

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
      const payload: SingleOrgSummary = {
        'pbaNumber': 'SU2DSCSA',
         'status': 'ACTIVE',
         'effective_date': '22/10/2022',
         'dx_exchange': '7654321',
         'name': 'Speake Limited',
         'address': '72 Guild Street, London, SE23 6FH',
         'dxNumber': '12345567',
         'dxExchange': '7654321',
         'admin': 'Matt Speake',
       };
      const action = new LoadSingleOrgSuccess(payload);
      const state = reducer(initialState, action);
      expect(state.data).toEqual(payload);
    });
  });

  describe('getSingleOrganisation export', () => {
    it('should return state.organisation', () => {
      expect(fromSingleOrgPending.getSingleOrgOverview(initialState)).toEqual({});
    });
  });
