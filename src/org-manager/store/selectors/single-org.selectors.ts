import { createSelector } from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromSingleOrg from '../reducers/single-org.reducer';

export const getSingleOrgState = createSelector(
  fromFeature.getRootOrganisationsState,
  (state: fromFeature.OrganisationState) => state.singleOrg
);

export const getSingleOrgOverview = createSelector(
  getSingleOrgState,
  fromSingleOrg.getSingleOrgOverview
);

export const orgSummaryLoading = createSelector(getSingleOrgState, fromSingleOrg.getSingleOrgOverviewLoading);
export const orgSummaryLoaded = createSelector(getSingleOrgState, fromSingleOrg.getSingleOrgOverviewLoaded);


