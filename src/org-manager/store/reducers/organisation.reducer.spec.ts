import { User } from '@hmcts/rpx-xui-common-lib';
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
      expect(state.pendingOrganisations).toEqual({orgEntities: {}, loaded: false, loading: true, searchString: ''});
    });

  });

  describe('LOAD_ACTIVE_ORGANISATION action', () => {
    it('should return the initial state.pendingOrganisations', () => {

      const action = new fromActions.LoadActiveOrganisation();
      const state = reducer(initialState, action);
      expect(state.pendingOrganisations).toEqual({orgEntities: {}, loaded: false, loading: false, searchString: ''});
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

  describe('LOAD_PBA_ACCOUNT_NAME_SUCCESS action', () => {
    it('should update the state with account details', () => {
      const action = new fromActions.LoadPbaAccountDetailsSuccess({orgId: '12345', data: fromMock.LoadPbaAccuntsObj});
      const state = reducer(initialState, action);
      expect(state.pendingOrganisations.orgEntities).toEqual({12345: {isAccLoaded: true, accountDetails: fromMock.LoadPbaAccuntsObj }} as any);
    });

  });

  describe('LOAD_ORGANISATION_USERS action', () => {
    it('should return the initial state.organisationUsersList', () => {

      const action = new fromActions.LoadOrganisationUsers('orgId');
      const state = reducer(initialState, action);
      expect(state.organisationUsersList).toEqual({users: null, isError: false});
    });
  });

  describe('LOAD_ORGANISATION_USERS_SUCCESS action', () => {
    it('should assign LOAD_ORGANISATION_USERS_SUCCESS payload to organisationUsersList ', () => {
      const mockUserResult: User[] = [{
        fullName: 'hello world',
        email: 'test@test.com',
        resendInvite: false,
        status: 'Active',
        ['manageCases']: 'Yes',
        ['manageUsers']: 'Yes',
        ['manageOrganisations']: 'No'
      }];
      const action = new fromActions.LoadOrganisationUsersSuccess(mockUserResult);
      const state = reducer(initialState, action);
      expect(state.organisationUsersList).toEqual({users: mockUserResult, isError: false});
    });
  });

  describe('RESET_ORGANISATION_USERS action', () => {
    it('should return the state.organisationUsersList to null when reset', () => {
      const action = new fromActions.ResetOrganisationUsers();
      const state = reducer(initialState, action);
      expect(state.organisationUsersList).toEqual( { users: null, isError: false });
    });
  });

  describe('DISPLAY_ERROR_MESSAGE_ORGANISATIONS action', () => {
    it('should assigned the state.errorMessage to the payload error Message', () => {
      const action = new fromActions.DisplayErrorMessageOrganisations('error');
      const state = reducer(initialState, action);
      expect(state.errorMessage).toEqual('error');
    });
  });

  describe('UPDATE_ACTIVE_ORGANISATIONS_SEARCH_STRING action', () => {
    it('should assigned the state.activeOrganisations.searchString to the payload', () => {
      const action = new fromActions.UpdateActiveOrganisationsSearchString('searchthis');
      const state = reducer(initialState, action);
      expect(state.activeOrganisations.searchString).toEqual('searchthis');
    });
  });
});
