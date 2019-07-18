import { PendingOrgActions, PendingOrgActionTypes } from '../actions/org-pending.actions';
import { Organisation, OrganisationVM, OrganisationSummary } from 'src/org-manager/models/organisation';

// TODO: cleanup cascading pendingOrganisations
export interface OrganisationState {
  pendingOrganisations: OrganisationVM[];
  reviewedOrganisations: OrganisationVM[];
  responseMessages: object;
  loaded: boolean;
  loading: boolean;
  errorMessage: string;
}

export const initialState: OrganisationState = {
  pendingOrganisations: [],
  reviewedOrganisations: [],
  responseMessages: {},
  loaded: false,
  loading: false,
  errorMessage: ''
};

export function reducer(
  state = initialState,
  action: PendingOrgActions
): OrganisationState {
  switch (action.type) {

    case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS: {
      return {
        ...state,
        loaded: false,
        loading: true
      };
    }
    case PendingOrgActionTypes.ADD_REVIEW_ORGANISATIONS: {
      const payload: OrganisationVM[] = action.payload.slice(0);
      const reviewedOrganisationsMapped = payload.map(item => {
        return { ...item, status: 'ACTIVE' };
      });
      return {
        ...state,
        reviewedOrganisations: reviewedOrganisationsMapped,
        errorMessage: ''
      };
    }
    case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS: {
      // TODO please fix this - something is not right
      let pendingOrganisations = action.payload;
      if (pendingOrganisations.length !== 0) {
        pendingOrganisations = action.payload.map((pendingOrganisation: OrganisationVM) => {
          const routerLink: OrganisationSummary = {
            ...pendingOrganisation,
            routerLink: `/pending-organisations/organisation/${pendingOrganisation.organisationId}/`
          };
          return routerLink;
        });
      }
      const pendingOrganisationsMapped = pendingOrganisations;
      return {
        ...state,
        pendingOrganisations: pendingOrganisationsMapped,
        loaded: true,
        loading: false
      };
    }
    case PendingOrgActionTypes.DISPLAY_ERROR_MESSAGE_ORGANISATIONS:
      const errorMessage = action.payload;
      return {
        ...state,
        errorMessage
      };
    default:
      return state;
  }
}

export const getPendingOrganisations = (state: OrganisationState) => state.pendingOrganisations;
export const getReviewedOrganisations = (state: OrganisationState) => state.reviewedOrganisations;
export const dgetPendingOrgResponseMsg = (state: OrganisationState) => state.responseMessages;
export const getPendingOrganisationsLoading = (state: OrganisationState) => state.loading;
export const getPendingOrganisationsLoaded = (state: OrganisationState) => state.loaded;
export const getReviewedOrganisations = (state: OrganisationState) => state.reviewedOrganisations;
export const getErrorMessage = (state: OrganisationState) => state.errorMessage;
