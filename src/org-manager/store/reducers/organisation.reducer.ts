import * as fromOrganisationActions from '../actions/organisation.actions';
import {Organisation, OrganisationSummary} from '../../models/organisation';

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
      console.log(' action.payload',  action.payload)
      const payload = action.payload;
      let organisations = payload;
      if (organisations.length !== 0) {
        organisations = payload.map((entity: Organisation) => {
            const element: OrganisationSummary = {
              ...entity,
              routerLink: `/fee-accounts/account/${entity.pbaNumber}/`
            };
            return element;
          });
      }

      return {
        ...state,
          organisations: organisations,
          loaded: true,
          loading: false
      };
    }

  }

  return state;
}

export const getFeeAccounts = (state: OrganisationState) => state.organisations;
export const getFeeAccountsLoading = (state: OrganisationState) => state.loading;
export const getFeeAccountsLoaded = (state: OrganisationState) => state.loaded;
