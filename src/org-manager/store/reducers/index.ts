import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromOrganisations from './organisation.reducer';
import * as fromSingleOrg from './single-org.reducer';
import * as fromPendingOrganisations from './org-pending.reducer';
import * as fromSingleOrgPending from './single-org-pending.reducer';


export interface OrganisationState {
  organisations: fromOrganisations.OrganisationState;
  singleOrg: fromSingleOrg.SingleOrgState;
  pendingOrganisations: fromPendingOrganisations.OrganisationState;
  singleOrgPending: fromSingleOrgPending.PendingSingleOrgState;
}

export const reducers: ActionReducerMap<OrganisationState> = {
  organisations: fromOrganisations.reducer,
  singleOrg: fromSingleOrg.reducer,
  pendingOrganisations: fromPendingOrganisations.reducer,
  singleOrgPending: fromSingleOrgPending.reducer
};

export const getRootOrganisationsState = createFeatureSelector<OrganisationState>(
  'organisations'
);
