import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromOrganisations from './organisation.reducer';
import * as fromSingleFeeAccount from './single-fee-account.reducer';


export interface OrganisationState {
  organisations: fromOrganisations.OrganisationState;
  singleFeeAccount: fromSingleFeeAccount.SingleFeeAccountState;
}

export const reducers: ActionReducerMap<OrganisationState> = {
  organisations: fromOrganisations.reducer,
  singleFeeAccount: fromSingleFeeAccount.reducer,
};

export const getRootOrganisationsState = createFeatureSelector<OrganisationState>(
  'organisations'
);
