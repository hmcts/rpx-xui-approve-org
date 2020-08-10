import { PendingOrganisationsMockCollection1, PendingOrganisationsMockCollectionObj } from '../../mock/pending-organisation.mock';
import * as fromPendingOrganisation from './organisations.actions';

describe('PendingOrganisationActions actions', () => {
  const payload = PendingOrganisationsMockCollection1;

  describe('LoadPendingOrganisations actions GROUP', () => {
    // Init state
    describe('LoadPendingOrganisation', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.LoadPendingOrganisations();
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.LOAD_PENDING_ORGANISATIONS,
        });
      });
    });

    // Success
    describe('LoadPendingOrganisationSuccess', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.LoadPendingOrganisationsSuccess(payload);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS,
          payload
        });
      });
    });

    // Fail
    describe('LoadPendingOrganisationFail', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.LoadPendingOrganisationsFail('error');
        const errorPayload = 'error';
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.LOAD_PENDING_ORGANISATIONS_FAIL,
          payload: errorPayload
        });
      });
    });
  });

  describe('ApprovePendingOrganisations actions GROUP', () => {
    // Success
    describe('ApprovePendingOrganisationsSuccess', () => {
      it('should create an action', () => {

        const action = new fromPendingOrganisation.ApprovePendingOrganisationsSuccess(PendingOrganisationsMockCollectionObj);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS,
          payload: payload[0]
        });
      });
    });

    // Fail
    describe('ApprovePendingOrganisationsFail', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.ApprovePendingOrganisationsFail('error');
        const errorPayload = 'error';
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_FAIL,
          payload: errorPayload
        });
      });
    });
  });

  describe('DeletePendingOrganisations actions GROUP', () => {
    // Initial action
    describe('DeletePendingOrganisation', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.DeletePendingOrganisation(payload[0]);
        expect({ ...action}).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.DELETE_PENDING_ORGANISATION,
          payload: payload[0]
        });
      });
    });

    // Success
    describe('DeletePendingOrganisationSuccess', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.DeletePendingOrganisationSuccess(payload[0]);
        expect({ ...action}).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.DELETE_PENDING_ORGANISATION_SUCCESS,
          payload: payload[0]
        });
      });
    });

    // Fail
    describe('DeletePendingOrganisationFail', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.DeletePendingOrganisationFail();
        expect({ ...action}).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.DELETE_PENDING_ORGANISATION_FAIL
        });
      });
    });
  });

  describe('LoadPbaAccountDetails actions GROUP', () => {
    // Load
    describe('LoadPbaAccountsDetails', () => {
      it('should create an action', () => {
        const payload0 = {pbas: 'PBA1234567', orgId: '12345'};
        const action = new fromPendingOrganisation.LoadPbaAccountsDetails(payload0);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME,
          payload: payload0
        });
      });
    });

    // Success
    describe('LoadPbaAccountDetailsSuccess', () => {
      it('should create an action', () => {
        const payload2 = {data: [{account_name: 'PBA1234567'}], orgId: '12345'};
        const action = new fromPendingOrganisation.LoadPbaAccountDetailsSuccess(payload2);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME_SUCCESS,
          payload: payload2
        });
      });
    });

    // Fail
    describe('LoadPbaAccountDetailsFail', () => {
      it('should create an action', () => {
        const payload2 = {data: [{account_name: 'PBA1234567'}], orgId: '12345'};
        const action = new fromPendingOrganisation.LoadPbaAccountDetailsFail(payload2);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME_FAIL,
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
        const action = new fromPendingOrganisation.LoadOrganisationUsers(payload0);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.LOAD_ORGANISATION_USERS,
          payload: payload0
        });
      });
    });

    // Success
    describe('LoadOrganisationUsersSuccess', () => {
      it('should create an action', () => {
        const payload2 = {};
        const action = new fromPendingOrganisation.LoadOrganisationUsersSuccess(payload2);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.LOAD_ORGANISATION_USERS_SUCCESS,
          payload: payload2
        });
      });
    });

    // Fail
    describe('LoadOrganisationUsersFail', () => {
      it('should create an action', () => {
        const payload2 = new Error('test error');
        const action = new fromPendingOrganisation.LoadOrganisationUsersFail(payload2);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.LOAD_ORGANISATION_USERS_FAIL,
          payload: payload2
        });
      });
    });
  });

  // RESET
  describe('ResetOrganisationUsers', () => {
    it('should create an action', () => {
      const action = new fromPendingOrganisation.ResetOrganisationUsers();
      expect({ ...action }).toEqual({
        type: fromPendingOrganisation.OrgActionTypes.RESET_ORGANISATION_USERS
      });
    });
  });
});
