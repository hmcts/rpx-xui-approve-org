import { User } from '@hmcts/rpx-xui-common-lib';
import * as fromActions from '../actions/users.actions';

export interface UsersState {
  pendingUser: User;
  organisationId: string;
}

export const initialState: UsersState = {
  pendingUser: null,
  organisationId: null
};

export function reducer(
  state = initialState,
  action: fromActions.UsersAction
): UsersState {
  switch (action.type) {
    case fromActions.REINVITE_PENDING_USER: {
      console.log('coming to reducer:');
      console.log(action.payload);
      return {
        ...state,
        pendingUser: action.payload.pendingUser,
        organisationId: action.payload.organisationId
      };
    }

    case fromActions.SUBMIT_REINVITE_USER_SUCCESS: {
      console.log('submit success response: ');
      console.log(action.payload);
      return {
        ...state
      };
    }

    case fromActions.SUBMIT_REINVITE_USER_ERROR: {
      console.log('submit error response: ');
      console.log(action.payload);
      return {
        ...state
      };
    }
    default:
      return state;
  }
}

export const getPendingUser = (state: UsersState) => state.pendingUser;
export const getOrganisationId = (state: UsersState) => state.organisationId;
