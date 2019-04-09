import {createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromOrganisation from '../reducers/organisation.reducer';



export const selectFeatureFee = createFeatureSelector<fromFeature.OrganisationState>('feeAccounts');
export const getOrganisationsState = createSelector( selectFeatureFee, (state: any) => state.feeAccounts);
export const organisations = createSelector( getOrganisationsState, fromOrganisation.getFeeAccounts);
export const organisationsLoading = createSelector( getOrganisationsState, fromOrganisation.getFeeAccountsLoading);
export const organisationsLoaded = createSelector( getOrganisationsState, fromOrganisation.getFeeAccountsLoaded);
