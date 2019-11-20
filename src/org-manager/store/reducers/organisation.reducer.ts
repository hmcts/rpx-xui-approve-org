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
}

export const initialState: OrganisationState = {
  activeOrganisations: {orgs: [], loaded: false, loading: false},
  pendingOrganisations: {orgs: [], loaded: false, loading: false},
  errorMessage: ''
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
      // TODO please fix this - something is not right
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

    // case fromActions.OrgActionTypes.ADD_REVIEW_ORGANISATIONS: {
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
export const getPendingOrganisationsLoading = (state: OrganisationState) => state.pendingOrganisations.loading;
export const getPendingOrganisationsLoaded = (state: OrganisationState) => state.pendingOrganisations.loaded;
export const getActiveOrg = (state: OrganisationState) => state.activeOrganisations;
export const getPendingOrg = (state: OrganisationState) => state.pendingOrganisations;
export const getErrorMessage = (state: OrganisationState) => state.errorMessage;
