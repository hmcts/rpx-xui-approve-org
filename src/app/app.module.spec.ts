import { metaReducers } from './app.module';
import { MetaReducer } from '@ngrx/store';

describe('appModule', () => {
    describe('metaReducer', () => {
        it('can be set and retrieved', () => {
            const reducer: MetaReducer<any> = () => { return () => {}};

            metaReducers.push(reducer);

            expect(metaReducers.length).toEqual(1);
        })
    })
})