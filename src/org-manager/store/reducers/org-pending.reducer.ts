import { PendingOrgActions, } from '../actions/org-pending.actions';
import * as fromActions from '../actions/org-pending.actions';
import {OrganisationVM} from 'src/org-manager/models/organisation';

export interface OrganisationState {
  activeOrganisation: {
    orgs: OrganisationVM[],
    loaded: boolean;
    loading: boolean;
  } | null;
  pendingOrganisations: {
    orgs: OrganisationVM[];
    loaded: boolean;
    loading: boolean;
  } | null;
  errorMessage: string;
}

export const initialState: OrganisationState = {
  pendingOrganisations: null,
  activeOrganisation: null,
  errorMessage: ''
};

export function reducer(
  state = initialState,
  action: PendingOrgActions
): OrganisationState {
  switch (action.type) {
    case fromActions.LOAD_ORGANISATIONS: {
      const activeOrganisation = {
        orgs: {...state.activeOrganisation.orgs},
        loaded: false,
        loading: true
      }
      return {
        ...state,
        activeOrganisation
      };
    }
    case fromActions.LOAD_ORGANISATIONS_SUCCESS: {
      const orgs = action.payload;
      const activeOrganisation = {
        orgs,
        loaded: false,
        loading: true
      }
      return {
        ...state,
        activeOrganisation
      };
    }

    case fromActions.PendingOrgActionTypes.CLEAR_ERRORS: {
      return {
        ...state,
        errorMessage: ''
      };
    }

    case fromActions.PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS: {
      const pendingOrganisations = {
        orgs: {...state.activeOrganisation.orgs},
        loaded: false,
        loading: true
      }
      return {
        ...state,
        pendingOrganisations
      };
    }

    case fromActions.PendingOrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS: {
      // TODO please fix this - something is not right
      const orgs = action.payload;
      const pendingOrganisations = {
        orgs,
        loaded: false,
        loading: true
      }
      return {
        ...state,
        pendingOrganisations
      };
    }

    // case fromActions.PendingOrgActionTypes.ADD_REVIEW_ORGANISATIONS: {
    //   const payload: OrganisationVM[] = action.payload.slice(0);
    //   const reviewedOrganisationsMapped = payload.map(item => {
    //     return { ...item, status: 'ACTIVE' };
    //   });
    //   return {
    //     ...state,
    //     reviewedOrganisations: reviewedOrganisationsMapped,
    //     errorMessage: ''
    //   };
    // }


    case fromActions.PendingOrgActionTypes.DISPLAY_ERROR_MESSAGE_ORGANISATIONS:
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
export const getPendingOrganisationsLoading = (state: OrganisationState) => state.pendingOrganisations.loading;
export const getPendingOrganisationsLoaded = (state: OrganisationState) => state.pendingOrganisations.loaded;
export const getReviewedOrganisations = (state: OrganisationState) => state.activeOrganisation;
export const getErrorMessage = (state: OrganisationState) => state.errorMessage;
