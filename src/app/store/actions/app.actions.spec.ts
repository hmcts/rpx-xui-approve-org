import * as fromApp from './app.actions';
import { GlobalError } from '../reducers/app.reducer';

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
