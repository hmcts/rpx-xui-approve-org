import { initialState, reducer } from './edit-details.reducer';
import * as fromActions from '../actions/edit-details.actions';

describe('Edit Details Reducer', () => {
  describe('Edit PBA ', () => {
    describe('undefined action', () => {
      it('should return the default state', () => {
        const action = {} as any;
        const state = reducer(undefined, action);
        expect(state).toEqual(initialState);
      });
    });

    describe('DISPATCH_SAVE_PBA_VALIDATION action', () => {
      it('should return form error messages', () => {
        const payload = {isInvalid: {}, errorMsg: ['some error message']};
        const action = new fromActions.DispatchSaveValidation(payload);
        const state = reducer(initialState, action);
        expect(state.pba).toEqual({errorMessages: {}, isFormValid: true, serverError: null});
      });
    });

    describe('SUBMIT_PBA_SUCCESS action', () => {
      it('should return clear the state', () => {
        const payload = {paymentAccounts: ['123'], orgId: '1234'};
        const action = new fromActions.SubmitPbaSuccess(payload);
        const state = reducer(initialState, action);
        expect(state.pba).toEqual({errorMessages: {}, isFormValid: true, serverError: null});
      });
    });

    describe('SUBMIT_PBA_FAILURE action', () => {
      it('should return clear the state', () => {
        const payload: any = {
          name: 'Some Name',
          error: {apiError: {errorDescription: 'some error message'}}
        };
        const action = new fromActions.SubmitPbaFailure(payload);
        const state = reducer(initialState, action);
        const errorMessages: any = {id: {isFormValid: false, messages: 'some error message'}};
        // @ts-ignore
        expect(state.pba).toEqual({errorMessages});
      });
    });
  });
});
