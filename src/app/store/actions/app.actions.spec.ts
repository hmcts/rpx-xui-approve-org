import * as fromApp from './app.actions';

describe('App Actions', () => {

  describe('Set page title', () => {
    it('should create an action', () => {
      const payload = 'value';
      const action = new fromApp.SetPageTitle(payload);

      expect({ ...action }).toEqual({
        type: fromApp.SET_PAGE_TITLE,
        payload,
      });
    });
  });

  describe('Set page title Fail', () => {
    it('should create an action', () => {
      const action = new fromApp.SetPageTitleErrors();

      expect({ ...action }).toEqual({
        type: fromApp.SET_PAGE_TITLE_ERRORS
      });
    });
  });

  describe('Logout', () => {
    it('should create an action', () => {
      const action = new fromApp.Logout();

      expect({ ...action }).toEqual({
        type: fromApp.LOGOUT
      });
    });
  });

});
