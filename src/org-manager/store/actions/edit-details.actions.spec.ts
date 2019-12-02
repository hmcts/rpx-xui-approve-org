import * as fromActions from './edit-details.actions';
describe('Edit Details actions', () => {

  describe('Edit PBA', () => {
    describe('DispatchSaveValidation', () => {
      it('should create an action', () => {
        const payload = {
          isInvalid: {},
          errorMsg: [{some: 'prop'}]
        }
        const action = new fromActions.DispatchSaveValidation(payload);
        expect({...action}).toEqual({
          type: fromActions.DISPATCH_SAVE_PBA_VALIDATION,
          payload
        });
      });
    });


    describe('SubmitPba', () => {
      it('should create an action', () => {
        const payload = {
          paymentAccounts: ['12345', '54321'],
          orgId: '0987865'
        }
        const action = new fromActions.SubmitPba(payload);
        expect({...action}).toEqual({
          type: fromActions.SUBMIT_PBA,
          payload
        });
      });
    });

    describe('SubmitPbaSuccess', () => {
      it('should create an action', () => {
        const payload = {
          paymentAccounts: ['12345', '54321'],
          orgId: '0987865'
        }
        const action = new fromActions.SubmitPbaSuccess(payload);
        expect({...action}).toEqual({
          type: fromActions.SUBMIT_PBA_SUCCESS,
          payload
        });
      });
    });

    describe('SubmitPbaFailure', () => {
      it('should create an action', () => {
        const payload = {
          name: 'Some Name',
          message: 'Some Message'
        };
        const action = new fromActions.SubmitPbaFailure(payload);
        expect({...action}).toEqual({
          type: fromActions.SUBMIT_PBA_FAILURE,
          payload
        });
      });
    });
  });
});

