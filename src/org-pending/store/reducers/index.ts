import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromPendingOrganisations from './org-pending.reducer';
import * as fromSingleOrg from './single-org-pending.reducer';


export interface PendingOrganisationState {
  pendingOrganisations: fromPendingOrganisations.PendingOrganisationState;
  singleOrg: fromSingleOrg.PendingSingleOrgState;
}

export const reducers: ActionReducerMap<PendingOrganisationState> = {
  pendingOrganisations: fromPendingOrganisations.reducer,
  singleOrg: fromSingleOrg.reducer
};

export const getRootPendingOrganisationsState = createFeatureSelector<PendingOrganisationState>(
  'org-pending'
);
