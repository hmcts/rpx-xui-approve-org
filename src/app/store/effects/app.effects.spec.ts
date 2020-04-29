import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { cold, hot } from 'jasmine-marbles';
import { LogOutKeepAliveService } from '../../services/keep-alive/keep-alive.service';
import { UserService } from '../../services/user-service/user.service';
import { AddGlobalError, Go } from '../actions';
import * as fromAppEffects from './app.effects';

describe('App Effects', () => {
    let actions$;
    let effects: fromAppEffects.AppEffects;
    const mockKeepAliveService = jasmine.createSpyObj('mockKeepAliveService', ['heartBeat', 'logOut']);
    const mockUserService = jasmine.createSpyObj('mockUserService', ['getUserDetails']);
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({}),
                HttpClientTestingModule
            ],
            providers: [
                fromAppEffects.AppEffects,
                provideMockActions(() => actions$),
                {provide: LogOutKeepAliveService, useValue: mockKeepAliveService},
                {provide: UserService, useValue: mockUserService}
            ]
        });

        effects = TestBed.get(fromAppEffects.AppEffects);

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
