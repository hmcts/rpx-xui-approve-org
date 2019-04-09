import {createFeatureSelector, createSelector} from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromFeeAccounts from '../reducers/organisation.reducer';



export const selectFeatureFee = createFeatureSelector<fromFeature.OrganisationState>('feeAccounts');
export const getFeeAccountsState = createSelector( selectFeatureFee, (state: any) => state.feeAccounts);
export const feeAccounts = createSelector( getFeeAccountsState, fromFeeAccounts.getFeeAccounts);
export const feeAccountsLoading = createSelector( getFeeAccountsState, fromFeeAccounts.getFeeAccountsLoading);
export const feeAccountsLoaded = createSelector( getFeeAccountsState, fromFeeAccounts.getFeeAccountsLoaded);
