import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { hot, cold } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import * as fromAppEffects from './app.effects';
import { AppEffects } from './app.effects';
import { AddGlobalError, Go } from '../actions';
import { StoreModule } from '@ngrx/store';


describe('App Effects', () => {
    let actions$;
    let effects: AppEffects;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({}),
                HttpClientTestingModule
            ],
            providers: [
                fromAppEffects.AppEffects,
                provideMockActions(() => actions$)
            ]
        });

        effects = TestBed.get(AppEffects);

    });

    describe('addGlobalErrorEffect$', () => {
        it('should trigger router action', () => {

            const action = new AddGlobalError({
                header: '',
                errors: []
            });
            const completion = new Go({
                path: ['/service-down']
            });

            actions$ = hot('-a', { a: action });
            const expected = cold('-b', { b: completion });

            expect(effects.addGlobalErrorEffect$).toBeObservable(expected);
        });
    });



});
