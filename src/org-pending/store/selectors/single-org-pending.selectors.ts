
import * as fromOrganisation from '../reducers/single-org-pending.reducer'
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRoot from '../../../app/store';
import * as fromFeature from '../reducers';

export const getCurrentPage = createSelector(
  fromRoot.getRouterState,
  (router) => router.state.params
);






