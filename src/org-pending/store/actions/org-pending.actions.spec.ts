import * as fromPendingOrganisation from './org-pending.actions';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';
import { PendingOrganisationsMockCollection1 } from '../../mock/pending-organisation.mock';

describe('PendingOrganisationActions actions', () => {
  const payload: PendingOrganisation[] = PendingOrganisationsMockCollection1;

  describe('LoadPendingOrganisations actions GROUP', () => {
    // Init state
    describe('LoadPendingOrganisation', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.LoadPendingOrganisations();
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS,
        });
      });
    });

    // Success
    describe('LoadPendingOrganisationSuccess', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.LoadPendingOrganisationsSuccess(payload);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS,
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
          type: fromPendingOrganisation.PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_FAIL,
          payload: errorPayload
        });
      });
    });
  });

  describe('ApprovePendingOrganisations actions', () => {
    // add to review state
    describe('ApprovePendingOrganisationsSuccess', () => {
      it('should add organisation to review action', () => {
        const action = new fromPendingOrganisation.AddReviewOrganisations(payload);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.PendingOrgActionTypes.ADD_REVIEW_ORGANISATIONS,
          payload
        });
      });
    });

    // Success
    describe('ApprovePendingOrganisationsSuccess', () => {
      it('should create an action', () => {

        const action = new fromPendingOrganisation.ApprovePendingOrganisationsSuccess(payload);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.PendingOrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS,
          payload
        });
      });
    });

    // Fail
    describe('ApprovePendingOrganisationsFail', () => {
      it('should create an action', () => {
        const action = new fromPendingOrganisation.ApprovePendingOrganisationsFail('error');
        const errorPayload = 'error';
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.PendingOrgActionTypes.APPROVE_PENDING_ORGANISATIONS_FAIL,
          payload: errorPayload
        });
      });
    });
  });
});
