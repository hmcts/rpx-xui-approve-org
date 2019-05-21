import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromPendingOrganisations from './org-pending.reducer';
import * as fromSingleOrgPending from './single-org-pending.reducer';
import * as fromProduct from './product.reducer';


export interface PendingOrganisationState {
  pendingOrganisations: fromPendingOrganisations.PendingOrganisationState;
  singleOrgPending: fromSingleOrgPending.PendingSingleOrgState;
  product: fromProduct.ProductState;
}

export const reducers: ActionReducerMap<PendingOrganisationState> = {
  pendingOrganisations: fromPendingOrganisations.reducer,
  singleOrgPending: fromSingleOrgPending.reducer,
  product: fromProduct.reducer
};

export const getRootPendingOrganisationsState = createFeatureSelector<PendingOrganisationState>(
  'org-pending'
);
