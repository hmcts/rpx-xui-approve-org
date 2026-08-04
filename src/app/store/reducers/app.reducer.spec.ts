import { UserModel } from 'src/models/user.model';
import * as fromActions from '../actions';
import * as appReducer from './app.reducer';

describe('App Reducer', () => {
  it('should return the default state', () => {
    const action = {} as any;
    const state = appReducer.reducer(undefined, action);
    expect(state).toEqual(appReducer.initialState);
  });

  describe('LOGOUT', () => {
    it('should reset to initial state', () => {
      const currentState = {
        ...appReducer.initialState,
        pageTitle: 'Current page',
        loaded: true,
        globalError: {
          header: 'Error',
          errors: []
        }
      };
      const action = new fromActions.Logout();
      const state = appReducer.reducer(currentState, action);

      expect(state).toEqual(appReducer.initialState);
    });
  });

  describe('SET_MODAL', () => {
    it('should update modal state', () => {
      const modal = {
        session: {
          countdown: '30',
          isVisible: true
        }
      };
      const action = new fromActions.SetModal(modal);
      const state = appReducer.reducer(appReducer.initialState, action);

      expect(state).toEqual({
        ...appReducer.initialState,
        modal
      });
    });
  });

  describe('APP_ADD_GLOBAL_ERROR', () => {
    it('should return state', () => {
      const action = new fromActions.AddGlobalError({
        header: '',
        errors: []
      });
      const state = appReducer.reducer(appReducer.initialState, action);
      const expectedState = {
        ...appReducer.initialState,
        globalError: {
          header: '',
          errors: []
        }
      };
      expect(state).toEqual(expectedState);
    });
  });

  describe('APP_CLEAR_GLOBAL_ERROR', () => {
    it('should return state', () => {
      const action = new fromActions.ClearGlobalError();
      const state = appReducer.reducer(appReducer.initialState, action);
      const expectedState = {
        ...appReducer.initialState,
        globalError: null
      };
      expect(state).toEqual(expectedState);
    });
  });

  describe('GET_USER_DETAILS_SUCCESS', () => {
    it('should return state', () => {
      const user = {
        email: 'string',
        orgId: 'string',
        roles: [],
        userId: 'string'
      };

      const userDetails = new UserModel(user);

      const action = new fromActions.GetUserDetailsSuccess(user);
      const state = appReducer.reducer(appReducer.initialState, action);
      const expectedState = {
        ...appReducer.initialState,
        userDetails,
        loaded: true,
        loading: false
      };
      expect(state).toEqual(expectedState);
    });
  });

  describe('selectors', () => {
    const userDetails = new UserModel({
      email: 'user@example.com',
      idleTime: 300000,
      roles: [],
      timeout: 60
    });
    const globalError = {
      header: 'Service unavailable',
      errors: []
    };
    const state = {
      ...appReducer.initialState,
      pageTitle: 'Page title',
      userDetails,
      globalError
    };

    it('should get page title', () => {
      expect(appReducer.getPageTitle(state)).toEqual('Page title');
    });

    it('should get user details', () => {
      expect(appReducer.getUserDetails(state)).toEqual(userDetails);
    });

    it('should get modal state', () => {
      expect(appReducer.getModal(state)).toEqual(appReducer.initialState.modal);
    });

    it('should get global error', () => {
      expect(appReducer.getGlobalError(state)).toEqual(globalError);
    });
  });
});
