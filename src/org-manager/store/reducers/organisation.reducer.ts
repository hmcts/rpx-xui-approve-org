import * as fromActions from '../actions/organisations.actions';
import { OrganisationVM } from 'src/org-manager/models/organisation';

export interface OrganisationState {
  activeOrganisations: {
    orgs: OrganisationVM[],
    loaded: boolean;
    loading: boolean;
  };
  pendingOrganisations: {
    orgs: OrganisationVM[];
    loaded: boolean;
    loading: boolean;
  };
  errorMessage: string;
  orgForReview: OrganisationVM | null;
}

export const initialState: OrganisationState = {
  activeOrganisations: {orgs: [], loaded: false, loading: false},
  pendingOrganisations: {orgs: [], loaded: false, loading: false},
  errorMessage: '',
  orgForReview: null
};

export function reducer(
  state = initialState,
  action: fromActions.OrganisationsActions
): OrganisationState {
  switch (action.type) {

    case fromActions.OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS: {
      const activeOrganisations = {
        orgs: null,
        loaded: false,
        loading: true
      }
      return {
        ...state,
        activeOrganisations
      };
    }
    case fromActions.OrgActionTypes.LOAD_ACTIVE_ORGANISATIONS_SUCCESS: {
      const orgs = action.payload;
      const activeOrganisations = {
        orgs,
        loaded: true,
        loading: false
      }
      return {
        ...state,
        activeOrganisations
      };
    }

    case fromActions.OrgActionTypes.CLEAR_ERRORS: {
      return {
        ...state,
        errorMessage: ''
      };
    }

    case fromActions.OrgActionTypes.LOAD_PENDING_ORGANISATIONS: {
      const pendingOrganisations = {
        orgs: {...state.activeOrganisations.orgs},
        loaded: false,
        loading: true
      }
      return {
        ...state,
        pendingOrganisations
      };
    }

    case fromActions.OrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS: {
      const orgs = action.payload;
      const pendingOrganisations = {
        orgs,
        loaded: true,
        loading: true
      }
      return {
        ...state,
        pendingOrganisations
      };
    }

    case fromActions.OrgActionTypes.ADD_REVIEW_ORGANISATIONS: {
      const orgForReview = action.payload;
      return {
        ...state,
        orgForReview,
        errorMessage: ''
      };
    }


    case fromActions.OrgActionTypes.DISPLAY_ERROR_MESSAGE_ORGANISATIONS:
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
export const getActiveOrg = (state: OrganisationState) => state.activeOrganisations;
export const getPendingOrg = (state: OrganisationState) => state.pendingOrganisations;
export const getOrgForReview = (state: OrganisationState) => state.orgForReview;
