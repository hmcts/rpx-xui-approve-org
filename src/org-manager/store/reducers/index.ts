import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import * as fromPendingOrganisations from './org-pending.reducer';
import * as fromOrganisations from './organisation.reducer';
import * as fromSingleOrgPending from './single-org-pending.reducer';
import * as fromSingleOrg from './single-org.reducer';


export interface OrganisationState {
  activeOrg: fromOrganisations.OrganisationState;
  orgDetails: fromSingleOrg.SingleOrgState;
  pendingOrganisations: fromPendingOrganisations.OrganisationState;
  singleOrgPending: fromSingleOrgPending.PendingSingleOrgState;
}

export const reducers: ActionReducerMap<OrganisationState> = {
  activeOrg: fromOrganisations.reducer,
  orgDetails: fromSingleOrg.reducer,
  pendingOrganisations: fromPendingOrganisations.reducer,
  singleOrgPending: fromSingleOrgPending.reducer
};

export const getRootApproveOrgState = createFeatureSelector<OrganisationState>(
  'approveOrg'
);
