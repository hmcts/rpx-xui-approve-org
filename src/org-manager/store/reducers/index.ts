import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromOrganisations from './organisation.reducer';
import * as fromPendingOrganisations from './org-pending.reducer';

export interface OrganisationState {
  activeOrg: fromOrganisations.OrganisationState;
  pendingOrganisations: fromPendingOrganisations.OrganisationState;
}

export const reducers: ActionReducerMap<OrganisationState> = {
  activeOrg: fromOrganisations.reducer,
  pendingOrganisations: fromPendingOrganisations.reducer,
};

export const getRootApproveOrgState = createFeatureSelector<OrganisationState>(
  'approveOrg'
);
