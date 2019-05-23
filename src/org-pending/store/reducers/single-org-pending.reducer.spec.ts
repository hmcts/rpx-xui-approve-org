import { initialState, reducer } from './single-org-pending.reducer';
import { LoadSingleOrgSuccess } from '../actions';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import * as fromSingleOrg from './single-org-pending.reducer';

  describe('SingleOrgPendingReducer', () => {
    describe('undefined action', () => {
      it('should return the default state', () => {
        const action = {} as any;
        const state = reducer(undefined, action);
        expect(state).toEqual(initialState);
      });
    });
});
