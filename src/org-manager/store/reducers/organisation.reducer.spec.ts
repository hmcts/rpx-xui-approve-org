import { User } from '@hmcts/rpx-xui-common-lib';
import * as fromMock from '../../mock/pending-organisation.mock';
import { OrganisationVM } from '../../models/organisation';
import * as fromActions from '../actions';
import { initialState, reducer } from './organisation.reducer';

describe('Organisation Reducer', () => {
  const pendingOrganisationsMock: OrganisationVM[] = fromMock.pendingOrganisationsMockCollection1;

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
      expect(state.pendingOrganisations).toEqual({ orgEntities: {}, loaded: false, loading: true, searchString: '' });
    });
  });

  describe('LOAD_ACTIVE_ORGANISATION action', () => {
    it('should return the initial state.activeOrganisations', () => {
      const action = new fromActions.LoadActiveOrganisation();
      const state = reducer(initialState, action);
      expect(state.activeOrganisations).toEqual({ orgEntities: {}, loaded: false, loading: true, searchString: '' });
    });
  });

  describe('LOAD_PENDING_ORGANISATION_SUCCESS action', () => {
    it('should update the state.pendingOrganisations', () => {
      const action = new fromActions.LoadPendingOrganisationsSuccess(pendingOrganisationsMock);
      const state = reducer(initialState, action);
      expect(state.pendingOrganisations.orgEntities.ByrneLimited).toBeDefined();
    });
  });

  describe('LOAD_ACTIVE_ORGANISATION_SUCCESS action', () => {
    it('should update the state.activeOrganisations', () => {
      const action = new fromActions.LoadActiveOrganisationSuccess(pendingOrganisationsMock);
      const state = reducer(initialState, action);
      expect(state.pendingOrganisations.orgEntities).toEqual({});
    });
  });

  describe('ADD_REVIEW_ORGANISATIONS action', () => {
    it('should update the state.orgForReview', () => {
      const action = new fromActions.AddReviewOrganisations(pendingOrganisationsMock[0]);
      const state = reducer(initialState, action);
      expect(state.orgForReview.organisationId).toEqual('ByrneLimited');
    });
  });

  describe('NAV_TO_DELETE_ORGANISATION action', () => {
    it('should update the state.orgForReview', () => {
      const action = new fromActions.NavigateToDeleteOrganisation(pendingOrganisationsMock[0]);
      const state = reducer(initialState, action);
      expect(state.orgForReview.organisationId).toEqual('ByrneLimited');
    });
  });

  describe('NAV_TO_REVIEW_ORGANISATION action', () => {
    it('should update the state.orgForReview', () => {
      const action = new fromActions.NavigateToReviewOrganisation(pendingOrganisationsMock[0]);
      const state = reducer(initialState, action);
      expect(state.orgForReview.organisationId).toEqual('ByrneLimited');
    });
  });

  describe('LOAD_PBA_ACCOUNT_NAME_SUCCESS action', () => {
    it('should update the state with account details', () => {
      const action = new fromActions.LoadPbaAccountDetailsSuccess({ orgId: '12345', data: fromMock.loadPbaAccountsObj });
      const state = reducer(initialState, action);
      expect(state.pendingOrganisations.orgEntities).toEqual({ 12345: { isAccLoaded: true, accountDetails: fromMock.loadPbaAccountsObj } } as any);
    });
  });

  describe('LOAD_ORGANISATION_USERS action', () => {
    it('should return the initial state.organisationUsersList', () => {
      const orgId = 'orgId';
      const pageNo = 1;
      const payload = { orgId, pageNo };
      const action = new fromActions.LoadOrganisationUsers(payload);
      const state = reducer(initialState, action);
      expect(state.organisationUsersList).toEqual({ users: null, isError: false });
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
      expect(state.organisationUsersList).toEqual({ users: mockUserResult, isError: false });
    });
  });

  describe('RESET_ORGANISATION_USERS action', () => {
    it('should return the state.organisationUsersList to null when reset', () => {
      const action = new fromActions.ResetOrganisationUsers();
      const state = reducer(initialState, action);
      expect(state.organisationUsersList).toEqual({ users: null, isError: false });
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

  describe('SHOW_ORGANISATION_DETAILS_USER_TAB action', () => {
    it('should not show user tab when orgid does not match', () => {
      const action = new fromActions.ShowOrganisationDetailsUserTab({ orgId: 'dummy', showUserTab: true });
      const state = reducer(initialState, action);
      expect(state.showOrganisationDetailsUserTab.showUserTab).toBeFalsy();
    });
  });

  describe('GET_ORGANISATION_DELETABLE_STATUS_SUCCESS action', () => {
    it('should update state.organisationDeletable with the payload value', () => {
      const action = new fromActions.GetOrganisationDeletableStatusSuccess(true);
      const state = reducer(initialState, action);
      expect(state.organisationDeletable).toEqual(true);
    });
  });

  describe('DELETE_PENDING_ORGANISATION_SUCCESS action', () => {
    it('should remove the deleted organisation from state.pendingOrganisations.orgEntities', () => {
      // Load a pending organisation and check it is contained in the state
      const preAction = new fromActions.LoadPendingOrganisationsSuccess(pendingOrganisationsMock);
      const preState = reducer(initialState, preAction);
      expect(preState.pendingOrganisations.orgEntities).toEqual({
        [pendingOrganisationsMock[0].organisationId]: pendingOrganisationsMock[0]
      });
      // Delete the organisation and check it is removed from the state
      const action = new fromActions.DeletePendingOrganisationSuccess(pendingOrganisationsMock[0]);
      const state = reducer(preState, action);
      expect(state.pendingOrganisations.orgEntities).toEqual({});
    });
  });

  describe('DELETE_ORGANISATION_SUCCESS action', () => {
    it('should remove the deleted organisation from state.activeOrganisations.orgEntities', () => {
      // Load an active organisation and check it is contained in the state
      const preAction = new fromActions.LoadActiveOrganisationSuccess(pendingOrganisationsMock);
      const preState = reducer(initialState, preAction);
      expect(preState.activeOrganisations.orgEntities).toEqual({
        [pendingOrganisationsMock[0].organisationId]: pendingOrganisationsMock[0]
      });
      // Delete the organisation and check it is removed from the state
      const action = new fromActions.DeleteOrganisationSuccess(pendingOrganisationsMock[0]);
      const state = reducer(preState, action);
      expect(state.activeOrganisations.orgEntities).toEqual({});
    });
  });

  describe('PUT_REVIEW_ORGANISATION_SUCCESS action', () => {
    it('should update organisation status as REVIEW on state.pendingOrganisations.orgEntities', () => {
      const preAction = new fromActions.LoadPendingOrganisationsSuccess(pendingOrganisationsMock);
      const preState = reducer(initialState, preAction);
      const action = new fromActions.PutReviewOrganisationSuccess(pendingOrganisationsMock[0]);
      const state = reducer(preState, action);
      expect(state.pendingOrganisations.orgEntities).toEqual({ ByrneLimited: { ...pendingOrganisationsMock[0], status: 'REVIEW' } });
    });
  });
});
