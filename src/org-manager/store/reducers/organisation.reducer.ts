import * as fromActions from '../actions/organisations.actions';
import { OrganisationVM } from 'src/org-manager/models/organisation';

export interface OrganisationState {
  activeOrganisation: {
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
  pendingOrganisations: {orgs: null, loaded: false, loading: false},
  activeOrganisation: {orgs: null, loaded: false, loading: false},
  errorMessage: ''
};

export function reducer(
  state = initialState,
  action: fromActions.OrganisationsActions
): OrganisationState {
  switch (action.type) {

    case fromActions.OrgActionTypes.LOAD_ORGANISATIONS: {
      const activeOrganisation = {
        orgs: null,
        loaded: false,
        loading: true
      }
      return {
        ...state,
        activeOrganisation
      };
    }
    case fromActions.OrgActionTypes.LOAD_ORGANISATIONS_SUCCESS: {
      const orgs = action.payload;
      debugger;
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

    case fromActions.OrgActionTypes.CLEAR_ERRORS: {
      return {
        ...state,
        errorMessage: ''
      };
    }

    case fromActions.OrgActionTypes.LOAD_PENDING_ORGANISATIONS: {
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

    case fromActions.OrgActionTypes.LOAD_PENDING_ORGANISATIONS_SUCCESS: {
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
export const getReviewedOrganisations = (state: OrganisationState) => state.activeOrganisation;
export const getErrorMessage = (state: OrganisationState) => state.errorMessage;
