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
});

