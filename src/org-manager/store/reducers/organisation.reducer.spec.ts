import {OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromMock from '../../mock/pending-organisation.mock';
import * as fromActions from '../actions';
import { initialState, reducer } from './organisation.reducer';


describe('Organisation Reducer', () => {

  const pendingOrganisationsMock: OrganisationVM[] = fromMock.PendingOrganisationsMockCollection1;

  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const state = reducer(undefined, action);
      expect(state).toEqual(initialState);
    });
  });

  describe('LOAD_PENDING_ORGANISATION action', () => {
    it('should return the initial state.pendingOrganisations', () => {

      const action = new fromActions.LoadPendingOrganisations();
      const state = reducer(initialState, action);
      expect(state.pendingOrganisations).toEqual({orgEntities: {}, loaded: false, loading: true});
    });

  });

  describe('LOAD_ACTIVE_ORGANISATION action', () => {
    it('should return the initial state.pendingOrganisations', () => {

      const action = new fromActions.LoadActiveOrganisation();
      const state = reducer(initialState, action);
      expect(state.pendingOrganisations).toEqual({orgEntities: {}, loaded: false, loading: false});
    });

  });

  describe('LOAD_PENDING_ORGANISATION_SUCCESS action', () => {
    it('should update the state.pendingOrganisations', () => {
      const action = new fromActions.LoadPendingOrganisationsSuccess(pendingOrganisationsMock);
      const state = reducer(initialState, action);
      expect(state).toEqual(fromMock.orgStatePending as any);
    });

  });

  describe('LOAD_ACTIVE_ORGANISATION_SUCCESS action', () => {
    it('should update the state.pendingOrganisations', () => {
      const action = new fromActions.LoadActiveOrganisationSuccess(pendingOrganisationsMock);
      const state = reducer(initialState, action);
      expect(state).toEqual(fromMock.orgStateActive as any);
    });

  });

  describe('ADD_REVIEW_ORGANISATIONS action', () => {
    it('should update the state.orgForReview', () => {

      const action = new fromActions.AddReviewOrganisations(pendingOrganisationsMock[0]);
      const state = reducer(initialState, action);
      expect(state.orgForReview).toEqual(pendingOrganisationsMock[0]);
    });

  });
});
