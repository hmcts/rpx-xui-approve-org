import { UserModel } from 'src/models/user.model';
import * as fromAppFeature from '../reducers/app.reducer';
import * as fromRoot from '../reducers';
import * as fromSelectors from './app.selectors';

describe('App selectors', () => {
  const globalError: fromAppFeature.GlobalError = {
    header: 'Service unavailable',
    errors: [{
      bodyText: 'Try again later.',
      urlText: 'Go back',
      url: '/home'
    }]
  };
  const user = new UserModel({
    emailId: 'user@example.com',
    idleTime: 300000,
    roles: ['prd-admin'],
    timeout: 60
  });
  const appState: fromAppFeature.AppState = {
    ...fromAppFeature.initialState,
    pageTitle: 'Approve organisation',
    userDetails: user,
    modal: {
      session: {
        countdown: '20',
        isVisible: true
      }
    },
    globalError
  };
  const state = {
    appState
  } as fromRoot.State;

  it('should select app state', () => {
    expect(fromSelectors.getAppState(state)).toEqual(appState);
  });

  it('should select page title', () => {
    expect(fromSelectors.getAppPageTitle(state)).toEqual('Approve organisation');
  });

  it('should select the current user', () => {
    expect(fromSelectors.getUser(state)).toEqual(user);
  });

  it('should select user idle time', () => {
    expect(fromSelectors.getUserIdleTime(state)).toEqual(300000);
  });

  it('should return NaN when user idle time is unavailable', () => {
    expect(fromSelectors.getUserIdleTime.projector(null)).toBeNaN();
  });

  it('should select user timeout', () => {
    expect(fromSelectors.getUserTimeOut(state)).toEqual(60);
  });

  it('should return NaN when user timeout is unavailable', () => {
    expect(fromSelectors.getUserTimeOut.projector(null)).toBeNaN();
  });

  it('should select modal session data', () => {
    expect(fromSelectors.getModalSessionData(state)).toEqual({
      countdown: '20',
      isVisible: true
    });
  });

  it('should select current error', () => {
    expect(fromSelectors.getCurrentError(state)).toEqual(globalError);
  });
});
