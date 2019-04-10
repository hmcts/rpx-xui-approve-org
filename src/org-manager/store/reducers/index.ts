import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromOrganisations from './organisation.reducer';
import * as fromSingleFeeAccount from './single-org.reducer';


export interface OrganisationState {
  organisations: fromOrganisations.OrganisationState;
  singleFeeAccount: fromSingleFeeAccount.SingleOrgState;
}

export const reducers: ActionReducerMap<OrganisationState> = {
  organisations: fromOrganisations.reducer,
  singleFeeAccount: fromSingleFeeAccount.reducer,
};

export const getRootOrganisationsState = createFeatureSelector<OrganisationState>(
  'organisations'
);
