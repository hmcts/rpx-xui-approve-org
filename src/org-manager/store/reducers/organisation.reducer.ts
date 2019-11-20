import * as fromActions from '../actions/organisations.actions';
import { OrganisationVM } from 'src/org-manager/models/organisation';

export interface OrganisationState {
  activeOrganisations: {
    orgEntities: {[id: string]: OrganisationVM},
    loaded: boolean;
    loading: boolean;
  };
  pendingOrganisations: {
    orgEntities: {[id: string]: OrganisationVM},
    loaded: boolean;
    loading: boolean;
  };
  errorMessage: string;
  orgForReview: OrganisationVM | null;
}

export const initialState: OrganisationState = {
  activeOrganisations: {orgEntities: {}, loaded: false, loading: false},
  pendingOrganisations: {orgEntities: {}, loaded: false, loading: false},
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
        orgEntities: {},
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
      const orgEntities = orgs.reduce((entities: {[id: string]: OrganisationVM}, org: OrganisationVM) => {
        return {
          ...entities,
          [org.organisationId]: org
        }
      }, {...state.activeOrganisations.orgEntities});
      const activeOrganisations = {
        orgEntities,
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
        orgEntities: {},
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
      const orgEntities = orgs.reduce((entities: {[id: string]: OrganisationVM}, org: OrganisationVM) => {
        return {
          ...entities,
          [org.organisationId]: org
        }
      }, {...state.pendingOrganisations.orgEntities});

      const pendingOrganisations = {
        orgEntities,
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

    case fromActions.OrgActionTypes.APPROVE_PENDING_ORGANISATIONS_SUCCESS: {
      const approvedOrg = action.payload;
      const activeEntities = {
        ...state.activeOrganisations.orgEntities,
        [approvedOrg.organisationId]: approvedOrg
      };
      const activeOrganisations = {
        orgEntities: activeEntities,
        loaded: true,
        loading: false
      };

      const pendingEntities = {
        ...state.pendingOrganisations.orgEntities,
      };

      if (pendingEntities.hasOwnProperty(approvedOrg.organisationId)) {
        delete pendingEntities[approvedOrg.organisationId];
      }

      const pendingOrganisations = {
        ...state.pendingOrganisations,
        orgEntities: pendingEntities
      };
      return {
        ...state,
        activeOrganisations,
        pendingOrganisations,
        errorMessage: '',
        orgForReview: null
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

export const getPendingOrganis = (state: OrganisationState) => state.pendingOrganisations;
export const getActiveOrgEntities = (state: OrganisationState) => state.activeOrganisations;
export const getPendingOrgEntities = (state: OrganisationState) => state.pendingOrganisations;
export const getOrgForReview = (state: OrganisationState) => state.orgForReview;
