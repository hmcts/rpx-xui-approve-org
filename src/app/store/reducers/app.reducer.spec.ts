import * as fromActions from '../actions';
import * as appReducer from './app.reducer';

describe('App Reducer', () => {
    it('should return the default state', () => {
        const action = {} as any;
        const state = appReducer.reducer(undefined, action);
        expect(state).toEqual(appReducer.initialState);
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
});
