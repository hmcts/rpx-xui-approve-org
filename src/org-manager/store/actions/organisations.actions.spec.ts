import { PendingOrganisationsMockCollection1, PendingOrganisationsMockCollectionObj } from '../../mock/pending-organisation.mock';
import * as fromOrganisation from './organisations.actions';

describe('PendingOrganisationActions actions', () => {
  const payload = PendingOrganisationsMockCollection1;

  describe('LoadPendingOrganisations actions GROUP', () => {
    // Init state
    describe('LoadPendingOrganisations', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.LoadPendingOrganisations();
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.LOAD_PENDING_ORGANISATIONS,
        });
      });
    });

    // Success
    describe('LoadPendingOrganisationsSuccess', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.LoadPendingOrganisationsSuccess(payload);
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS,
          payload
        });
      });
    });

    // Fail
    describe('LoadPendingOrganisationsFail', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.LoadPendingOrganisationsFail('error');
        const errorPayload = 'error';
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.LOAD_PENDING_ORGANISATIONS_FAIL,
          payload: errorPayload
        });
      });
    });
  });

  describe('ApprovePendingOrganisations actions GROUP', () => {
    // Success
    describe('ApprovePendingOrganisationsSuccess', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.ApprovePendingOrganisationsSuccess(PendingOrganisationsMockCollectionObj);
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS,
          payload: PendingOrganisationsMockCollectionObj
        });
      });
    });

    // Fail
    describe('ApprovePendingOrganisationsFail', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.ApprovePendingOrganisationsFail('error');
        const errorPayload = 'error';
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_FAIL,
          payload: errorPayload
        });
      });
    });
  });

  describe('DeletePendingOrganisation actions GROUP', () => {
    // Initial action
    describe('DeletePendingOrganisation', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.DeletePendingOrganisation(PendingOrganisationsMockCollectionObj);
        expect({ ...action}).toEqual({
          type: fromOrganisation.OrgActionTypes.DELETE_PENDING_ORGANISATION,
          payload: PendingOrganisationsMockCollectionObj
        });
      });
    });

    // Success
    describe('DeletePendingOrganisationSuccess', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.DeletePendingOrganisationSuccess(PendingOrganisationsMockCollectionObj);
        expect({ ...action}).toEqual({
          type: fromOrganisation.OrgActionTypes.DELETE_PENDING_ORGANISATION_SUCCESS,
          payload: PendingOrganisationsMockCollectionObj
        });
      });
    });

    // Fail
    // This action is redundant at present but the test is included for completeness
    describe('DeletePendingOrganisationFail', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.DeletePendingOrganisationFail();
        expect({ ...action}).toEqual({
          type: fromOrganisation.OrgActionTypes.DELETE_PENDING_ORGANISATION_FAIL
        });
      });
    });
  });

  describe('DeleteOrganisation actions GROUP', () => {
    // Initial action
    describe('DeleteOrganisation', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.DeleteOrganisation(PendingOrganisationsMockCollectionObj);
        expect({ ...action}).toEqual({
          type: fromOrganisation.OrgActionTypes.DELETE_ORGANISATION,
          payload: PendingOrganisationsMockCollectionObj
        });
      });
    });

    // Success
    describe('DeleteOrganisationSuccess', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.DeleteOrganisationSuccess(PendingOrganisationsMockCollectionObj);
        expect({ ...action}).toEqual({
          type: fromOrganisation.OrgActionTypes.DELETE_ORGANISATION_SUCCESS,
          payload: PendingOrganisationsMockCollectionObj
        });
      });
    });

    // Fail
    // No failure case because errors are handled using an "Add Global Error" action
  });

  describe('LoadPbaAccountDetails actions GROUP', () => {
    // Load
    describe('LoadPbaAccountsDetails', () => {
      it('should create an action', () => {
        const payload0 = {pbas: 'PBA1234567', orgId: '12345'};
        const action = new fromOrganisation.LoadPbaAccountsDetails(payload0);
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME,
          payload: payload0
        });
      });
    });

    // Success
    describe('LoadPbaAccountDetailsSuccess', () => {
      it('should create an action', () => {
        const payload2 = {data: [{account_name: 'PBA1234567'}], orgId: '12345'};
        const action = new fromOrganisation.LoadPbaAccountDetailsSuccess(payload2);
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME_SUCCESS,
          payload: payload2
        });
      });
    });

    // Fail
    describe('LoadPbaAccountDetailsFail', () => {
      it('should create an action', () => {
        const payload2 = {data: [{account_name: 'PBA1234567'}], orgId: '12345'};
        const action = new fromOrganisation.LoadPbaAccountDetailsFail(payload2);
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME_FAIL,
          payload: payload2
        });
      });
    });
  });

  describe('LoadOrganisationUsers actions GROUP', () => {
    // Load
    describe('LoadOrganisationUsers', () => {
      it('should create an action', () => {
        const payload0 = 'orgId';
        const action = new fromOrganisation.LoadOrganisationUsers(payload0);
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.LOAD_ORGANISATION_USERS,
          payload: payload0
        });
      });
    });

    // Success
    describe('LoadOrganisationUsersSuccess', () => {
      it('should create an action', () => {
        const payload2 = {};
        const action = new fromOrganisation.LoadOrganisationUsersSuccess(payload2);
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.LOAD_ORGANISATION_USERS_SUCCESS,
          payload: payload2
        });
      });
    });

    // Fail
    describe('LoadOrganisationUsersFail', () => {
      it('should create an action', () => {
        const payload2 = new Error('test error');
        const action = new fromOrganisation.LoadOrganisationUsersFail(payload2);
        expect({ ...action }).toEqual({
          type: fromOrganisation.OrgActionTypes.LOAD_ORGANISATION_USERS_FAIL,
          payload: payload2
        });
      });
    });
  });

  // RESET
  describe('ResetOrganisationUsers', () => {
    it('should create an action', () => {
      const action = new fromOrganisation.ResetOrganisationUsers();
      expect({ ...action }).toEqual({
        type: fromOrganisation.OrgActionTypes.RESET_ORGANISATION_USERS
      });
    });
  });

  describe('GetOrganisationDeletableStatus actions GROUP', () => {
    // Initial action
    describe('GetOrganisationDeletableStatus', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.GetOrganisationDeletableStatus('abc123');
        expect({ ...action}).toEqual({
          type: fromOrganisation.OrgActionTypes.GET_ORGANISATION_DELETABLE_STATUS,
          payload: 'abc123'
        });
      });
    });

    // Success
    describe('GetOrganisationDeletableStatusSuccess', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.GetOrganisationDeletableStatusSuccess(true);
        expect({ ...action}).toEqual({
          type: fromOrganisation.OrgActionTypes.GET_ORGANISATION_DELETABLE_STATUS_SUCCESS,
          payload: true
        });
      });
    });

    // Fail
    // No failure case because errors are handled using an "Add Global Error" action
  });
});
