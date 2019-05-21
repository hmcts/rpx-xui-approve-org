import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromPendingOrganisations from './org-pending.reducer';
import * as fromSingleOrgPending from './single-org-pending.reducer';


export interface PendingOrganisationState {
  pendingOrganisations: fromPendingOrganisations.PendingOrganisationState;
  singleOrgPending: fromSingleOrgPending.PendingSingleOrgState;
}

export const reducers: ActionReducerMap<PendingOrganisationState> = {
  pendingOrganisations: fromPendingOrganisations.reducer,
  singleOrgPending: fromSingleOrgPending.reducer
};

export const getRootPendingOrganisationsState = createFeatureSelector<PendingOrganisationState>(
  'org-pending'
);
