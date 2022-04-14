import * as appReducer from './app.reducer';
import * as fromActions from '../actions';
import { AppUtils } from 'src/app/utils/app-utils';
import { UserInterface, UserModel } from 'src/models/user.model';

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

    describe('GET_USER_DETAILS_SUCCESS', () => {
        it('should return state', () => {
            const userDetails = {
                email: 'example@hmcts.net',
                userId: '123',
                orgId: '1'
            };

            const action = new fromActions.GetUserDetailsSuccess(userDetails as UserInterface);

            const state = appReducer.reducer(appReducer.initialState, action);
            const expectedState = {
                ...appReducer.initialState,
                userDetails: new UserModel(userDetails),
                loaded: true
            };
            expect(state).toEqual(expectedState);
        });
    });
});
