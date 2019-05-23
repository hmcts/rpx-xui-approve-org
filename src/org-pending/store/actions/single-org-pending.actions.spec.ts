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

    // Success
    describe('LoadSingleOrganisationSuccess', () => {
      it('should create an action', () => {
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
        const action = new fromSingleOrg.LoadSingleOrgSuccess(payload);
        expect({ ...action }).toEqual({
          type: fromSingleOrg.SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS_SUCCESS,
          payload
        });
      });

              // Fail
              describe('LoadSingleOrganisationFail', () => {
                it('should create an action', () => {
                  // Action is not been used. Should be passing error handler or error friendly string.
                  const action = new fromSingleOrg.LoadSingleOrgFail('Something');
                  const payload = 'Something';
                  expect({ ...action }).toEqual({
                    type: fromSingleOrg.SinglePendingOrgActionTypes.LOAD_SINGLE_PENDING_ORGANISATIONS_FAIL,
                    payload
                  });
                });
         
          });
          });