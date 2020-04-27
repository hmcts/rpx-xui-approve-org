import * as fromActions from '../actions/users.actions';
import { initialState, reducer } from './users.reducer';
import { AppConstants } from 'src/app/app.constants';

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

    describe('SUBMIT_REINVITE_USER_SUCCESS action', () => {
      it('should assigned correct pending user and organisation id', () => {
        const payload = {successEmail: 'test@email.com'};
        const action = new fromActions.SubmitReinviteUserSucces(payload);
        const state = reducer(initialState, action);
        expect(state.reinviteSuccessEmail).toEqual('test@email.com');
      });
    });

    describe('SUBMIT_REINVITE_USER_ERROR_CODE_429 action', () => {
      it('should assigned correct error messages', () => {
        const payload = {};
        const errorMessages = {
          serverResponse1: {
            messages: ['This user has already been invited in the last hour']
          },
          serverResponse2: {
            messages: ['The recipient will receive an email from HM Courts and Tribunals Registrations so they can finish setting up their account']
          }
        };
        const action = new fromActions.SubmitReinviteUserErrorCode429(payload);
        const state = reducer(initialState, action);
        expect(state.isFormValid).toBeFalsy();
        expect(state.reinviteSuccessEmail).toBeNull();
        expect(state.errorMessages).toEqual(errorMessages);
      });
    });

    describe('SUBMIT_REINVITE_USER_ERROR action', () => {
      it('should return form error messages', () => {
        const payload = {error: {apiStatusCode: 400, message: 'error'}};
        const action = new fromActions.SubmitReinviteUserError(payload);
        const errorMessages = {
          serverResponse: {
            messages: [
              payload.error.apiStatusCode === 409 && AppConstants.ERROR_MESSAGE_MAPPINGS ? AppConstants.ERROR_MESSAGE_MAPPINGS[1] :  payload.error.message
            ]
          }
        };

        const state = reducer(initialState, action);
        expect(state.errorMessages).toEqual(errorMessages);
        expect(state.isFormValid).toBeFalsy();
        expect(state.reinviteSuccessEmail).toBeNull();
        expect(state.errorHeader).toEqual('Sorry, there is a problem with the service.');
      });
    });

  });
});
