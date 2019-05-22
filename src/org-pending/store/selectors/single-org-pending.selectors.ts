import { createSelector } from '@ngrx/store';
import * as fromFeature from '../reducers';
import * as fromSingleOrg from '../reducers/single-org-pending.reducer';
import * as fromRoot from '../../../app/store';

export const getSingleOrgState = createSelector(
  fromFeature.getRootPendingOrganisationsState,
  (state: fromFeature.PendingOrganisationState) => state.singleOrgPending
);

export const getSingleOrgOverview = createSelector(
  getSingleOrgState,
  fromSingleOrg.getSingleOrgOverview
);

export const getCurrentPage = createSelector(
  fromRoot.getRouterState,
  (router) => router.state.params
);

export const orgSummaryLoading = createSelector(getSingleOrgState, fromSingleOrg.getSingleOrgOverviewLoading);
export const orgSummaryLoaded = createSelector(getSingleOrgState, fromSingleOrg.getSingleOrgOverviewLoaded);


