import * as fromSingleOrg from './single-org-pending.actions';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';

describe('Single organisation actions', () => {
  describe('LoadSingleOrganisation actions GROUP', () => {
    // Init state
    describe('LoadSingleOrg', () => {
      it('should create an action', () => {
        const payload = 'A123';
        const action = new fromSingleOrg.LoadSingleOrg('A123');
        expect({ ...action }).toEqual({
          type: fromSingleOrg.SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS,
          payload
        });
      });
    });
  });
});