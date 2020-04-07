import * as fromActions from '../actions/users.actions';
import { initialState, reducer } from './users.reducer';

describe('Users Reducer', () => {
  describe('Reinvite User ', () => {
    describe('undefined action', () => {
      it('should return the default state', () => {
        const action = {} as any;
        const state = reducer(undefined, action);
        expect(state).toEqual(initialState);
      });
    });

    describe('SHOW_USER_DETAILS action', () => {
      it('should assigned correct pending user and organisation id', () => {
        const payload = {userDetails: { fullName: 'name name', email: 'email@email.com', status: 'Pending'}, orgId: 'id', isSuperUser: false};
        const action = new fromActions.ShowUserDetails(payload);
        const state = reducer(initialState, action);
        expect(state.selectedUser).toEqual({ fullName: 'name name', email: 'email@email.com', status: 'Pending'});
        expect(state.organisationId).toEqual('id');
        expect(state.isSuperUser).toEqual(false);
      });
    });

    describe('SUBMIT_REINVITE_USER_ERROR action', () => {
      it('should return form error messages', () => {
        const payload = {error: {apiStatusCode: 400, message: 'error'}};
        const action = new fromActions.SubmitReinviteUser(payload);
        const state = reducer(initialState, action);
        console.log('error messagess => ');
        console.log(state.errorMessages);
        expect(state.errorMessages).toEqual({});
        expect(state.isFormValid).toEqual(false);
      });
    });

  });
});
