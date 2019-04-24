import * as fromPendingOrganisationActions from '../actions/pending-organisation.actions';
import {PendingOrganisation} from '../../models/pending-organisation';

export interface PendingOrganisationState {
  pendingOrganisations: Array<PendingOrganisation> | null;
  loaded: boolean;
  loading: boolean;
}

export const initialState: PendingOrganisationState = {
  pendingOrganisations: null,
  loaded: false,
  loading: false,
};

export function reducer(
  state = initialState,
  action: fromPendingOrganisationActions.PendingOrganisationActions
): PendingOrganisationState {
  switch (action.type) {

    case fromPendingOrganisationActions.LOAD_PENDING_ORGANISATIONS: {
      console.log('existing state: ' + JSON.stringify(state));
      return {
        ...state,
        loaded: false,
        loading: true
      };
    }
    case fromPendingOrganisationActions.LOAD_PENDING_ORGANISATIONS_SUCCESS: {
      console.log('existing state in org pending success action call: ' + JSON.stringify(state));
      console.log(' action.payload in pending success',  action.payload)
      const payload = action.payload;
      let pendingOrganisations = payload;
      if (pendingOrganisations.length !== 0) {
        pendingOrganisations = payload.map((entity: PendingOrganisation) => {
            const element: PendingOrganisation = {
              ...entity
            };
            return element;
          });
          console.log('pending org is not empty and entity is' + pendingOrganisations.stringify)
      }
      console.log('existing state before return from org pending success: ' + JSON.stringify(state));
      console.log(' action.payload in pending success',  action.payload)
      return {
        ...state,
          pendingOrganisations: pendingOrganisations,
          loaded: true,
          loading: false
      };
    }

  }
  console.log('different case ' + JSON.stringify(state));
  return state;
}

export const getPendingOrganisations = (state: PendingOrganisationState) => state.pendingOrganisations;
export const getPendingOrganisationsLoading = (state: PendingOrganisationState) => state.loading;
export const getPendingOrganisationsLoaded = (state: PendingOrganisationState) => state.loaded;
