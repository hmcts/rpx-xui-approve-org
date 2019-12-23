import * as fromPendingOrganisation from './organisations.actions';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import {PendingOrganisationsMockCollection1, PendingOrganisationsMockCollectionObj} from 'src/org-manager/mock/pending-organisation.mock';

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
      const action = new fromPendingOrganisation.LoadPbaAccountDetailsSuccess(payload2);
      expect({ ...action }).toEqual({
        type: fromPendingOrganisation.OrgActionTypes.LOAD_PBA_ACCOUNT_NAME_SUCCESS,
        payload: payload2
      });
    });
  });
});

