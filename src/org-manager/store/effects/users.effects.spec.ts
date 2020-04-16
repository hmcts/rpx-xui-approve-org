import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import {of, throwError} from 'rxjs';
import { LoggerService } from 'src/app/services/logger.service';
import { UsersService } from 'src/org-manager/services';
import * as fromActions from '../actions/users.actions';
import * as fromEffects from './users.effects';
import { Go } from 'src/app/store';

export class LoggerServiceMock {
  public error(err) {
    return err;
  }
}

describe('Organisation Effects', () => {
  let actions$;
  let effects: fromEffects.UsersEffects;
  const usersServiceMock = jasmine.createSpyObj('UsersService', [
    'inviteUser',
  ]);

  const mockedLoggerService = jasmine.createSpyObj('mockedLoggerService', ['trace', 'info', 'debug', 'log', 'warn', 'error', 'fatal']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        fromEffects.UsersEffects,
        provideMockActions(() => actions$),
        {
          provide: LoggerService,
          useClass: LoggerServiceMock
        },
        {
          provide: LoggerService,
          useValue: mockedLoggerService
        },
      ]
    });

    effects = TestBed.get(fromEffects.UsersEffects);

  });


  describe('Users Effects$', () => {
    it('should showUserDetails  action', () => {
      const action = new fromActions.ShowUserDetails({userDetails: {}, orgId: 'id', isSuperUser: true});
      const completion = new Go({
        path: ['/user-details']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.showUserDetails$).toBeObservable(expected);
    });
  });

  describe('Users Effects$', () => {
    it('should reinviteUser  action', () => {
      const action = new fromActions.ReinvitePendingUser();
      const completion = new Go({
        path: ['/reinvite-user']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.reinviteUser$).toBeObservable(expected);
    });
  });

  describe('Users Effects$', () => {
    it('should confirmUser  action', () => {
      const action = new fromActions.SubmitReinviteUserSucces({success: true, successEmail: 'test@email.com'});
      const completion = new Go({
        path: ['/reinvite-user-success']
      });
      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.confirmUser$).toBeObservable(expected);
    });
  });

  describe('Users Effects ', () => {
    it('should submit reinvite users successfully', () => {
      usersServiceMock.inviteUser.and.returnValue(of({success: true}));
      const payload = {organisationId: 'id', form: {email: 'test@email.com'}};
      const action = new fromActions.SubmitReinviteUser(payload);
      const completion = new fromActions.SubmitReinviteUserSucces({success: true, successEmail: 'test@email.com'});
      actions$ = hot('-a', {a: action});
      const expected = cold('-b', {b: completion});
      expect(effects.submitReinviteUser$).toBeObservable(expected);
    });

    // it('should submit reinvite users fail', () => {
    //   usersServiceMock.inviteUser.and.returnValue(throwError(''));
    //   const payload = {organisationId: 'id', form: {}};
    //   const action = new fromActions.SubmitReinviteUser(payload);
    //   const completion = new fromActions.SubmitReinviteUserError('' as any);
    //   actions$ = hot('-a', {a: action});
    //   const expected = cold('-b', {b: completion});
    //   expect(effects.submitReinviteUser$).toBeObservable(expected);
    // });
  });
});

