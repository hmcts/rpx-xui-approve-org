import * as fromPendingOrganisation from './org-pending.actions';
import { PendingOrganisation } from 'src/org-pending/models/pending-organisation';

const payload: PendingOrganisation[] = [
  {
    name: 'Glen Byrne',
    organisationId: 'Byrne Limited',
    address: '13 Berryfield drive, Finglas',
    pbaNumber: '101010',
    admin: 'Glen Byrne',
    status: 'PENDING',
    view: 'View',
    id: '2424242',
    email: 'glen@byrne.com'
  }
];

describe('PendingOrganisationActions actions', () => {
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
