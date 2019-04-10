import * as fromSingleOrgActions from '../actions/single-org.actions';
import {SingleOrgSummary} from '../../models/single-org-summary';



export interface SingleOrgState {
  overview: {
    data: {}  | SingleOrgSummary;
    loaded: boolean;
    loading: boolean;
  };
  transactions: {
    data: {}  | SingleOrgSummary;
    loaded: boolean;
    loading: boolean;
  }
}

export const initialState: SingleOrgState = {
 overview: {
   data: {},
   loaded: false,
   loading: false,
 },
  transactions: {
    data: {},
    loaded: false,
    loading: false,
  }
};

export function reducer(
  state = initialState,
  action: fromSingleOrgActions.SingleFeeAccountActions
): SingleOrgState {
  switch (action.type) {
    case fromSingleOrgActions.LOAD_SINGLE_ORG_SUCCESS: {
      const payload = action.payload;
      return {
        ...state,
        overview: {
          data: action.payload,
          loaded: true,
          loading: false
        }

      };

    }
    case fromSingleOrgActions.RESET_SINGLE_ORG: {
      return initialState;
    }

  }

  return state;
}

export const getSingleOrgOverview = (state: SingleOrgState) => state.overview.data;
export const getSingleOrgOverviewLoading = (state: SingleOrgState) => state.overview.loading;
export const getSingleOrgOverviewLoaded = (state: SingleOrgState) => state.overview.loaded;