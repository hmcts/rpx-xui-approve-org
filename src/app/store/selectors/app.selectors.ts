import { createSelector } from '@ngrx/store';

import * as fromRoot from '../reducers';
import * as fromAppFeature from '../reducers/app.reducer';

export const getAppState = createSelector(
  fromRoot.getRootAppState,
  (state: fromAppFeature.AppState) => state
);

export const getUser = createSelector(
  getAppState,
  fromAppFeature.getUserDetails
);

export const getUserIdleTime = createSelector(
  getUser,
  (user) => (user && user.idleTime) ? user.idleTime : NaN
);

export const getUserTimeOut = createSelector(
  getUser,
  (user) => (user && user.timeout) ? user.timeout : NaN
);

export const getModalSessionData = createSelector(
  getAppState,
  (state) => state.modal.session
  );

export const getCurrentError = createSelector(
  getAppState,
  fromAppFeature.getGlobalError
);
