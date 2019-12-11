import * as fromSingleOrgActions from '../actions/single-org.actions';
import {SingleOrgSummary} from '../../models/single-org-summary';



export interface SingleOrgState {
    data: {}  | SingleOrgSummary;
    loaded: boolean;
    loading: boolean;
}

export const initialState: SingleOrgState = {
    data: {},
    loaded: false,
    loading: false,
};

export function reducer(
  state = initialState,
  action: fromSingleOrgActions.SinglePendingOrgActions
): SingleOrgState {
  switch (action.type) {
    case fromSingleOrgActions.LOAD_SINGLE_ORG_SUCCESS: {
      return {
        ...state,
          data: action.payload,
          loaded: true,
          loading: false
      };

    }
    case fromSingleOrgActions.RESET_SINGLE_ORG: {
      return initialState;
    }

  }

  return state;
}

export const getSingleOrgOverview = (state: SingleOrgState) => state.data;
export const getSingleOrgOverviewLoading = (state: SingleOrgState) => state.loading;
export const getSingleOrgOverviewLoaded = (state: SingleOrgState) => state.loaded;
