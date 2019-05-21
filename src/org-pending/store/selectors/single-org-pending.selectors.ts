
import * as fromRoot from '../../../app/store';
import { createSelector } from '@ngrx/store';

export const getCurrentPage = createSelector(
  fromRoot.getRouterState,
  (router) => router.state.params
);



