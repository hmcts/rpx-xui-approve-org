import * as fromApp from './app.actions';

describe('App Actions', () => {

  describe('Logout', () => {
    it('should create an action', () => {
      const action = new fromApp.Logout();

      expect({ ...action }).toEqual({
        type: fromApp.LOGOUT
      });
    });
  });

  describe('AddGlobalErrorSuccess', () => {
    it('should create an action', () => {
      const action = new fromApp.AddGlobalErrorSuccess();

      expect({ ...action }).toEqual({
        type: fromApp.APP_ADD_GLOBAL_ERROR_SUCCESS
      });
    });
  });

  describe('AddGlobalError', () => {
    it('should create an action', () => {
      const action = new fromApp.AddGlobalError({
        header: '',
        errors: [{
          bodyText: '',
          url: '',
          urlText: ''
        }]
      });

      expect({ ...action }).toEqual({
        type: fromApp.APP_ADD_GLOBAL_ERROR,
        payload: {
          header: '',
          errors: [{
            bodyText: '',
            url: '',
            urlText: ''
          }]
        }
      });
    });
  });

  describe('ClearGlobalError', () => {
    it('should create an action', () => {
      const action = new fromApp.ClearGlobalError();

      expect({ ...action }).toEqual({
        type: fromApp.APP_CLEAR_GLOBAL_ERROR
      });
    });
  });

});
