import * as fromSingleOrg from './single-org-pending.actions';
import { SingleOrgSummary } from '../../../org-manager/models/single-org-summary';
import { SingleOrgSummaryMock } from '../../../org-manager/mock/pending-organisation.mock';

describe('Single pending organisation actions', () => {
  describe('LoadSinglePendingOrganisation actions GROUP', () => {
    // Init state
    describe('LoadSingleOrg', () => {
      it('should create an action', () => {
        const payload = 'A123';
        const action = new fromSingleOrg.LoadSinglePendingOrg('A123');
        expect({ ...action }).toEqual({
          type: fromSingleOrg.SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS,
          payload
        });
      });
    });
  });
});

// Success
describe('LoadSinglePendingOrganisationSuccess', () => {
  it('should create an action', () => {
    const payload: SingleOrgSummary = SingleOrgSummaryMock;
    const action = new fromSingleOrg.LoadSinglePendingOrgSuccess(payload);
    expect({ ...action }).toEqual({
      type: fromSingleOrg.SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS_SUCCESS,
      payload
    });
  });

  // Fail
  describe('LoadSinglePendingOrganisationFail', () => {
    it('should create an action', () => {
      // Action is not been used. Should be passing error handler or error friendly string.
      const action = new fromSingleOrg.LoadSinglePendingOrgFail('Error');
      const payload = 'Error';
      expect({ ...action }).toEqual({
        type: fromSingleOrg.SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS_FAIL,
        payload
      });
    });
  });
});
