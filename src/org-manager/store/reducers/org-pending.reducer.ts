import { PendingOrganisation, PendingOrganisationSummary } from '../../../org-manager/models/pending-organisation';
import { PendingOrgActions, PendingOrgActionTypes } from '../actions/org-pending.actions';

// TODO: cleanup cascading pendingOrganisations
export interface OrganisationState {
  pendingOrganisations: PendingOrganisation[];
  reviewedOrganisations: PendingOrganisation[];
  loaded: boolean;
  loading: boolean;
}

export const initialState: OrganisationState = {
  pendingOrganisations: [],
  reviewedOrganisations: [],
  loaded: false,
  loading: false
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
      const payload: PendingOrganisation[] = action.payload.slice(0);
      const reviewedOrganisations = payload.map(item => {
        return {...item, status: 'ACTIVE'};
      });
      return {
        ...state,
        reviewedOrganisations: reviewedOrganisations
      };
    }
    case PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS: {
      // TODO please fix this - something is not right
      let pendingOrganisations = action.payload;
      if (pendingOrganisations.length !== 0) {
        pendingOrganisations = action.payload.map((pendingOrganisation: PendingOrganisation) => {
            const routerLink: PendingOrganisationSummary = {
              ...pendingOrganisation,
              routerLink: `/pending-organisations/organisation/${pendingOrganisation.pbaNumber}/`
            };
            return routerLink;
          });
      }
    return {
        ...state,
        pendingOrganisations:  pendingOrganisations,
        loaded: true,
        loading: false,
    };
  }

    default:
      return state;
  }
}

export const getPendingOrganisations = (state: OrganisationState) => state.pendingOrganisations;
export const getPendingOrganisationsLoading = (state: OrganisationState) => state.loading;
export const getPendingOrganisationsLoaded = (state: OrganisationState) => state.loaded;
export const getReviewedOrganisations = (state: OrganisationState) => state.reviewedOrganisations;
