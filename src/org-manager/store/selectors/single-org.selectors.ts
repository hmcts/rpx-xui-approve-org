import { createSelector } from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromSingleFeeAccount from '../reducers/single-org.reducer';

export const getSingleOrgState = createSelector(
  fromFeature.getRootOrganisationsState,
  (state: fromFeature.OrganisationState) => state.singleFeeAccount
);

export const getSingleAccounOverview = createSelector(
  getSingleOrgState,
  fromSingleFeeAccount.getSingleOrgOverview
);

export const orgSummaryLoading = createSelector(getSingleOrgState, fromSingleFeeAccount.getSingleOrgOverviewLoading);
export const orgSummaryLoaded = createSelector(getSingleOrgState, fromSingleFeeAccount.getSingleOrgOverviewLoaded);


