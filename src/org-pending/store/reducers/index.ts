import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromPendingOrganisations from './pending-organisation.reducer';



export interface PendingOrganisationState {
  pendingOrganisations: fromPendingOrganisations.PendingOrganisationState;
}

export const reducers: ActionReducerMap<PendingOrganisationState> = {
  pendingOrganisations: fromPendingOrganisations.reducer,
};

export const getRootPendingOrganisationsState = createFeatureSelector<PendingOrganisationState>(
  'org-pending'
);
