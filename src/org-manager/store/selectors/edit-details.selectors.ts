import {createSelector} from '@ngrx/store';

import * as fromRoot from '../../../app/store';
import * as fromOrganisation from '../reducers';
import * as fromEditDetails from '../reducers/edit-details.reducer';

export const getEditDetailsState = createSelector(
  fromOrganisation.getRootApproveOrgState,
  (state: fromOrganisation.OrganisationRootState) => state.editDetails
);

export const getPbaFromErrors = createSelector(
  getEditDetailsState,
  (editDetails: fromEditDetails.EditDetailsState) => editDetails.pba.errorMessages
);

