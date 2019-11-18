import * as fromOrganisationActions from '../actions/organisation.actions';
import {Organisation, OrganisationSummary, OrganisationVM} from '../../models/organisation';

export interface OrganisationState {
  organisations: Array<OrganisationSummary> | null;
  loaded: boolean;
  loading: boolean;
}

export const initialState: OrganisationState = {
  organisations: null,
  loaded: false,
  loading: false,
};

export function reducer(
  state = initialState,
  action: fromOrganisationActions.OrganisationActions
): OrganisationState {
  switch (action.type) {

    case fromOrganisationActions.LOAD_ORGANISATIONS: {
      return {
        ...state,
        loaded: false,
        loading: true
      };
    }
    case fromOrganisationActions.LOAD_ORGANISATIONS_SUCCESS: {
      const organisations = action.payload;

      return {
        ...state,
        organisations,
        loaded: true,
        loading: false
      };
    }

  }

  return state;
}

export const getOrganisations = (state: OrganisationState) => state.organisations;
export const getOrganisationsLoading = (state: OrganisationState) => state.loading;
export const getOrganisationsLoaded = (state: OrganisationState) => state.loaded;
