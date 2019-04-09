import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromFeeAccounts from './organisation.reducer';


export interface OrganisationState {
  feeAccounts: fromFeeAccounts.OrganisationState;
}

export const reducers: ActionReducerMap<OrganisationState> = {
  feeAccounts: fromFeeAccounts.reducer,
};

export const getRootFeeAccountsState = createFeatureSelector<OrganisationState>(
  'feeAccounts'
);
