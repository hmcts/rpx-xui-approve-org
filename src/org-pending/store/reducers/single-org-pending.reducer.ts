import * as fromSingleOrgActions from '../actions/single-org-pending.actions';
import {SingleOrgSummary} from '../../../org-manager/models/single-org-summary'

export interface PendingSingleOrgState {
    data: any;
    loaded: boolean;
    loading: boolean;
}

export const initialState: PendingSingleOrgState = {
    data: null,
    loaded: false,
    loading: false,
};

export function reducer(
  state = initialState,
  action: fromSingleOrgActions.SingleOrgActions
): PendingSingleOrgState {
  switch (action.type) {
    case fromSingleOrgActions.SinglePendingOrgActionTypes.LOAD_SUCCESS: {
      const payload = action.payload;
      console.log('in success')
      return {
        ...state,
          data: action.payload,
          loaded: true,
          loading: false
      };

    }
    case fromSingleOrgActions.SinglePendingOrgActionTypes.RESET_SINGLE_ORG: {
      return initialState;
    }

  }

  return state;
}

export const getSingleOrgOverview = (state: PendingSingleOrgState) => state.data;
export const getSingleOrgOverviewLoading = (state: PendingSingleOrgState) => state.loading;
export const getSingleOrgOverviewLoaded = (state: PendingSingleOrgState) => state.loaded;


