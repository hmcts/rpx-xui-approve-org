import { Request, Response } from 'express';
import * as sinon from 'sinon';
import { EnhancedRequest } from '../../models/enhanced-request.interface';
import { MockAxiosInstance, createMockAxiosInstance } from './httpMocks';

export interface MockEnhancedRequest extends Partial<EnhancedRequest> {
  session?: {
    passport?: {
      user?: {
        userinfo?: {
          roles?: string[];
        };
      };
    };
  };
  headers?: {
    Authorization?: string;
    ServiceAuthorization?: string;
    'user-roles'?: string[];
  };
  http?: MockAxiosInstance;
  isRefresh?: boolean;
}

export const createMockEnhancedRequest = (overrides: Partial<MockEnhancedRequest> = {}): MockEnhancedRequest => ({
  session: {
    passport: {
      user: {
        userinfo: { roles: ['test-role'] }
      }
    }
  },
  headers: {
    'Authorization': 'Bearer test-token',
    'ServiceAuthorization': 'Bearer s2s-token',
    'user-roles': ['test-role']
  },
  http: createMockAxiosInstance(),
  isRefresh: false,
  ...overrides
});

export const createMockResponse = () => ({
  status: sinon.stub().returnsThis(),
  send: sinon.stub().returnsThis(),
  json: sinon.stub().returnsThis(),
  redirect: sinon.stub().returnsThis(),
  cookie: sinon.stub().returnsThis(),
  end: sinon.stub().returnsThis()
});

export const createMockNextFunction = () => sinon.stub();

export const createAuthMocks = () => ({
  req: createMockEnhancedRequest(),
  res: createMockResponse(),
  next: createMockNextFunction()
});