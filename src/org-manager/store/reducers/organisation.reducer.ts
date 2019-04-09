import * as fromFeeAccountActions from '../actions/organisation.actions';
import {Organisation, OrganisationSummary} from '../../models/organisation';

export interface OrganisationState {
  organisation: Array<OrganisationSummary> | null;
  loaded: boolean;
  loading: boolean;
}

export const initialState: OrganisationState = {
  organisation: null,
  loaded: false,
  loading: false,
};

export function reducer(
  state = initialState,
  action: fromFeeAccountActions.OrganisationActions
): OrganisationState {
  switch (action.type) {

    case fromFeeAccountActions.LOAD_ORGANISATIONS: {
      return {
        ...state,
        loaded: false,
        loading: true
      };
    }
    case fromFeeAccountActions.LOAD_ORGANISATIONS_SUCCESS: {
      console.log(' action.payload',  action.payload)
      const payload = action.payload;
      let feeAccounts = payload;
      if (feeAccounts.length !== 0) {
        feeAccounts = payload.map((entity: Organisation) => {
            const element: OrganisationSummary = {
              ...entity,
              routerLink: `/fee-accounts/account/${entity.pbaNumber}/`
            };
            return element;
          });
      }

      return {
        ...state,
          organisation: feeAccounts,
          loaded: true,
          loading: false
      };
    }

  }

  return state;
}

export const getFeeAccounts = (state: OrganisationState) => state.organisation;
export const getFeeAccountsLoading = (state: OrganisationState) => state.loading;
export const getFeeAccountsLoaded = (state: OrganisationState) => state.loaded;
