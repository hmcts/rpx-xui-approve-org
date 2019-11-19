import * as fromPendingOrganisation from './organisations.actions';
import { Organisation, OrganisationVM } from 'src/org-manager/models/organisation';
import { PendingOrganisationsMockCollection1 } from 'src/org-manager/mock/pending-organisation.mock';

describe('PendingOrganisationActions actions', () => {
  const payload: OrganisationVM[] = PendingOrganisationsMockCollection1;

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

  describe('ApprovePendingOrganisations actions', () => {
    // add to review state
    describe('ApprovePendingOrganisationsSuccess', () => {
      it('should add organisation to review action', () => {
        const action = new fromPendingOrganisation.AddReviewOrganisations(payload);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.ADD_REVIEW_ORGANISATIONS,
          payload
        });
      });
    });

    // Success
    describe('ApprovePendingOrganisationsSuccess', () => {
      it('should create an action', () => {

        const action = new fromPendingOrganisation.ApprovePendingOrganisationsSuccess(payload);
        expect({ ...action }).toEqual({
          type: fromPendingOrganisation.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS,
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
          type: fromPendingOrganisation.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_FAIL,
          payload: errorPayload
        });
      });
    });
  });
});
