import * as fromActions from './users.actions';
describe('Users actions', () => {

  describe('REINVITE USERS', () => {
    describe('ReinvitePendingUser', () => {
      it('should create an action', () => {
        const payload = {
        };
        const action = new fromActions.ReinvitePendingUser(payload);
        expect({...action}).toEqual({
          type: fromActions.REINVITE_PENDING_USER,
          payload
        });
      });
    });

    describe('SubmitReinviteUser', () => {
      it('should create an action', () => {
        const payload = {
        };
        const action = new fromActions.SubmitReinviteUser(payload);
        expect({...action}).toEqual({
          type: fromActions.SUBMIT_REINVITE_USER,
          payload
        });
      });
    });

    describe('SubmitReinviteUserSucces', () => {
      it('should create an action', () => {
        const payload = {
        };
        const action = new fromActions.SubmitReinviteUserSucces(payload);
        expect({...action}).toEqual({
          type: fromActions.SUBMIT_REINVITE_USER_SUCCESS,
          payload
        });
      });
    });

    describe('SubmitReinviteUserError', () => {
      it('should create an action', () => {
        const payload = {
        };
        const action = new fromActions.SubmitReinviteUserError(payload);
        expect({...action}).toEqual({
          type: fromActions.SUBMIT_REINVITE_USER_ERROR,
          payload
        });
      });
    });

    describe('UpdateErrorMessages', () => {
      it('should create an action', () => {
        const payload = {
        };
        const action = new fromActions.UpdateErrorMessages(payload);
        expect({...action}).toEqual({
          type: fromActions.UPDATE_ERROR_MESSAGES,
          payload
        });
      });
    });

  });
});

