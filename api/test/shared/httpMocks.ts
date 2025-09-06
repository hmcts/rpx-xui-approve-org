import * as sinon from 'sinon';
import { AxiosInstance, AxiosResponse } from 'axios';

export interface MockAxiosInstance {
  get: sinon.SinonStub;
  post: sinon.SinonStub;
  put: sinon.SinonStub;
  delete: sinon.SinonStub;
  patch: sinon.SinonStub;
  interceptors: {
    request: { use: sinon.SinonStub };
    response: { use: sinon.SinonStub };
  };
}

export const createMockAxiosInstance = (): MockAxiosInstance => ({
  get: sinon.stub(),
  post: sinon.stub(),
  put: sinon.stub(),
  delete: sinon.stub(),
  patch: sinon.stub(),
  interceptors: {
    request: { use: sinon.stub() },
    response: { use: sinon.stub() }
  }
});

export const createMockAxiosResponse = <T = any>(data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {} as any
});

export const createAxiosMock = () => ({
  create: sinon.stub().returns(createMockAxiosInstance()),
  defaults: {
    headers: {
      common: {}
    }
  }
});