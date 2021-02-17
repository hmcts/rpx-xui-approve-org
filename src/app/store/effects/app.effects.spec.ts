import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { cold, hot } from 'jasmine-marbles';
import {
  TestColdObservable,
  TestHotObservable,
} from 'jasmine-marbles/src/test-observables';
import { of, throwError } from 'rxjs';
import { LogOutKeepAliveService } from '../../services/keep-alive/keep-alive.service';
import { UserService } from '../../services/user-service/user.service';
import {
  AddGlobalError,
  GetUserDetails,
  GetUserDetailsFailure,
  GetUserDetailsSuccess,
  Go,
  KeepAlive,
  Logout,
  SignedOut,
  SignedOutSuccess,
} from '../actions';
import * as fromAppEffects from './app.effects';
import SpyObj = jasmine.SpyObj;

describe('App Effects', () => {
  let actions$: TestHotObservable;
  let effects: fromAppEffects.AppEffects;
  const mockKeepAliveService: SpyObj<LogOutKeepAliveService> = (jasmine.createSpyObj(
    'mockKeepAliveService',
    ['heartBeat', 'logOut'],
  ) as unknown) as SpyObj<LogOutKeepAliveService>;

  const mockUserService: SpyObj<UserService> = (jasmine.createSpyObj(
    'mockUserService',
    ['getUserDetails'],
  ) as unknown) as SpyObj<UserService>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), HttpClientTestingModule],
      providers: [
        fromAppEffects.AppEffects,
        provideMockActions(() => actions$),
        { provide: LogOutKeepAliveService, useValue: mockKeepAliveService },
        { provide: UserService, useValue: mockUserService },
      ],
    });
    effects = (TestBed.get(
      fromAppEffects.AppEffects,
    ) as unknown) as fromAppEffects.AppEffects;
  });

  describe('addGlobalErrorEffect$', () => {
    it('should trigger router action', () => {
      const action = new AddGlobalError({ header: '', errors: [] });
      const completion = new Go({ path: ['/service-down'] });
      actions$ = hot('-a', { a: action });
      const expected: TestColdObservable = (cold('-b', {
        b: completion,
      }) as unknown) as TestColdObservable;
      expect(effects.addGlobalErrorEffect$).toBeObservable(expected);
    });
  });

  describe('logout$', () => {
    it('should logout out', () => {
      const action = new Logout();
      const completion = '/api/logout';
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.logout$).toBeTruthy();
    });
  });

  describe('signout$', () => {
    it('should sign out', () => {
      const action = new SignedOut();
      actions$ = hot('-a', { a: action });
      expect(effects.signOut$).toBeTruthy();
    });
  });

  describe('signedOutSuccess$', () => {
    it('should sign out successfully', () => {
      const action = new SignedOutSuccess();
      const completion = new Go({ path: ['/signed-out'] });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.signedOutSuccess$).toBeObservable(expected);
    });
  });

  describe('Keep Alive$', () => {
    it('should keep alive', () => {
      const action = new KeepAlive();
      const completion = new Go({ path: ['auth/keepalive'] });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.keepAlive$).toBeTruthy();
    });
  });
  describe('get users$', () => {
    const payload = {
      email: 'puisuperuser@mailnesia.com',
      orgId: '1',
      roles: [
        'pui-case-manager',
        'pui-user-manager',
        'pui-finance-manager',
        'pui-organisation-manager',
      ],
      userId: '5b9639a7-49a5-4c85-9e17-bf55186c8afa',
    };
    it('should give success', () => {
      mockUserService.getUserDetails.and.returnValue(of(payload));
      const action = new GetUserDetails();
      const completion = new GetUserDetailsSuccess(payload);
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.getUser$).toBeObservable(expected);
    });
    it('should give error', () => {
      mockUserService.getUserDetails.and.returnValue(
        throwError(new HttpErrorResponse({})),
      );
      const action = new GetUserDetails();
      const completion = new GetUserDetailsFailure(new HttpErrorResponse({}));
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.getUser$).toBeObservable(expected);
    });
  });
});
