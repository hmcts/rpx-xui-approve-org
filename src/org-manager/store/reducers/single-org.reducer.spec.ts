import { initialState, reducer } from './single-org.reducer';
import { LoadSingleOrgSuccess } from '../actions';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
  
  describe('SingleOrgReducer', () => {
    describe('undefined action', () => {
      it('should return the default state', () => {
        const action = {} as any;
        const state = reducer(undefined, action);
        expect(state).toEqual(initialState);
      });
    });
  
    /*describe('LOAD_SINGLE_ORG_SUCCESS action', () => {
      it('should update the state.feeAccounts', () => {
        const payload: SingleOrgSummary = 
        {
          "pbaNumber":"SU2DSCSA",
           "status": "ACTIVE",
           "effective_date": "22/10/2022",
           "dx_exchange": "7654321",
           "name": "Speake Limited",
           "address": "72 Guild Street, London, SE23 6FH",
           "dxNumber": "12345567",
           "dxExchange": "7654321",
           "admin": "Matt Speake",
         }
        const action = new LoadSingleOrgSuccess(payload);
        const state = reducer(initialState, action);
        expect(state.overview.data).toEqual({});
      });
    });
  /*
    describe('RESET_SINGLE_FEE_ACCOUNT action', () => {
      it('should return the initial state', () => {
        const action = new ResetSingleFeeAccount({});
        const state = reducer(initialState, action);
        expect(state.singleFeeAccount).toEqual([]);
      });
    });
  
    describe('getSingleFeeAccount export', () => {
      it('should return state.feeAccounts', () => {
        expect(getSingleFeeAccount(initialState)).toEqual([]);
      });
    });
  
    describe('getSingleFeeAccountLoading export', () => {
      it('should return state.loading', () => {
        expect(getSingleFeeAccountLoading(initialState)).toEqual(false);
      });
    });
  
    describe('getSingleFeeAccountLoaded export', () => {
      it('should return state.loaded', () => {
        expect(getSingleFeeAccountLoaded(initialState)).toEqual(false);
      });
    });
  });*/
});