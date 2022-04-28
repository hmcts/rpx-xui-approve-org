import { metaReducers } from "./app.module"
import { MetaReducer, StoreModule } from '@ngrx/store';
import { Actions } from "@ngrx/effects";

describe('appModule', () => {

    describe('metaReducer', () => {
        it('can be set and retrieved', () => {
            const reducer: MetaReducer<any> = () => { return () => {}};

            metaReducers.push(reducer);

            expect(metaReducers.length).toEqual(1);
        })
    })
})