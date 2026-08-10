import * as fromApp from './app.actions';
import { HttpErrorResponse } from '@angular/common/http';

describe('App Actions', () => {
  describe('GetUserDetails', () => {
    it('should create an action', () => {
      const action = new fromApp.GetUserDetails();

      expect({ ...action }).toEqual({
        type: fromApp.GET_USER_DETAILS
      });
    });
  });

  describe('GetUserDetailsSuccess', () => {
    it('should create an action', () => {
      const payload = {
        email: 'user@example.com',
        orgId: 'organisation-id',
        roles: ['prd-admin'],
        userId: 'user-id'
      };
      const action = new fromApp.GetUserDetailsSuccess(payload);

      expect({ ...action }).toEqual({
        type: fromApp.GET_USER_DETAILS_SUCCESS,
        payload
      });
    });
  });

  describe('GetUserDetailsFailure', () => {
    it('should create an action', () => {
      const payload = new HttpErrorResponse({ status: 500 });
      const action = new fromApp.GetUserDetailsFailure(payload);

      expect({ ...action }).toEqual({
        type: fromApp.GET_USER_DETAILS_FAIL,
        payload
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

  describe('SignedOut', () => {
    it('should create an action', () => {
      const action = new fromApp.SignedOut();

      expect({ ...action }).toEqual({
        type: fromApp.SIGNED_OUT
      });
    });
  });

  describe('SignedOutSuccess', () => {
    it('should create an action', () => {
      const action = new fromApp.SignedOutSuccess();

      expect({ ...action }).toEqual({
        type: fromApp.SIGNED_OUT_SUCCESS
      });
    });
  });

  describe('KeepAlive', () => {
    it('should create an action', () => {
      const action = new fromApp.KeepAlive();

      expect({ ...action }).toEqual({
        type: fromApp.KEEP_ALIVE
      });
    });
  });

  describe('SetModal', () => {
    it('should create an action', () => {
      const payload = {
        session: {
          countdown: '30',
          isVisible: true
        }
      };
      const action = new fromApp.SetModal(payload);

      expect({ ...action }).toEqual({
        type: fromApp.SET_MODAL,
        payload
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
