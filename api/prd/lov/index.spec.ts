import { expect } from '../../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockEnhancedRequest, createMockResponse } from '../../test/shared/authMocks';

describe('prd/lov/index', () => {
  let mockRequest: any;
  let mockResponse: any;
  let configStub: any;
  let nextStub: any;

  beforeEach(() => {
    mockRequest = createMockEnhancedRequest();
    mockResponse = createMockResponse();
    configStub = sinon.stub().returns('https://prd-commondata-api.example.com');
    nextStub = sinon.stub();

    sinon.stub(require('../../configuration'), 'getConfigValue').callsFake(configStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getLovRefData', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should get lov ref data with serviceId', async () => {
      mockRequest.query = {
        serviceId: 'service-123',
        categoryId: 'category-456',
        isChildRequired: 'false'
      };
      const responseData = {
        list_of_values: [
          { key: 'value1', value_en: 'Value 1' },
          { key: 'value2', value_en: 'Value 2' }
        ]
      };
      mockRequest.http.get.resolves({
        status: 200,
        data: responseData
      });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse, nextStub);

      expect(configStub).to.have.been.calledWith('services.prd.commondataApi');
      expect(mockRequest.http.get).to.have.been.calledWith(
        'https://prd-commondata-api.example.com/refdata/commondata/lov/categories/category-456?serviceId=service-123&isChildRequired=false'
      );
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledWith(responseData.list_of_values);
    });

    it('should get lov ref data without serviceId', async () => {
      mockRequest.query = {
        categoryId: 'category-456',
        isChildRequired: 'true'
      };
      const responseData = {
        list_of_values: [
          { key: 'parent1', value_en: 'Parent 1', child_nodes: [
            { key: 'child1', value_en: 'Child 1' }
          ] }
        ]
      };
      mockRequest.http.get.resolves({
        status: 200,
        data: responseData
      });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse, nextStub);

      expect(mockRequest.http.get).to.have.been.calledWith(
        'https://prd-commondata-api.example.com/refdata/commondata/lov/categories/category-456?isChildRequired=true'
      );
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledWith(responseData.list_of_values);
    });

    it('should handle different category IDs', async () => {
      mockRequest.query = {
        serviceId: 'different-service',
        categoryId: 'different-category',
        isChildRequired: 'false'
      };
      const responseData = { list_of_values: [] };
      mockRequest.http.get.resolves({
        status: 200,
        data: responseData
      });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse, nextStub);

      expect(mockRequest.http.get).to.have.been.calledWith(
        'https://prd-commondata-api.example.com/refdata/commondata/lov/categories/different-category?serviceId=different-service&isChildRequired=false'
      );
      expect(mockResponse.send).to.have.been.calledWith([]);
    });

    it('should handle API errors by calling next', async () => {
      mockRequest.query = {
        serviceId: 'service-123',
        categoryId: 'category-456',
        isChildRequired: 'false'
      };
      const error = new Error('API Error');
      mockRequest.http.get.rejects(error);

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse, nextStub);

      expect(nextStub).to.have.been.calledWith(error);
      expect(mockResponse.send).not.to.have.been.called;
    });

    it('should handle different status codes', async () => {
      mockRequest.query = {
        categoryId: 'category-456',
        isChildRequired: 'false'
      };
      const responseData = { list_of_values: [] };
      mockRequest.http.get.resolves({
        status: 404,
        data: responseData
      });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse, nextStub);

      expect(mockResponse.status).to.have.been.calledWith(404);
      expect(mockResponse.send).to.have.been.calledWith([]);
    });

    it('should use different PRD API URL from config', async () => {
      configStub.returns('https://different-prd-api.gov.uk');
      mockRequest.query = {
        categoryId: 'category-456',
        isChildRequired: 'false'
      };
      const responseData = { list_of_values: [] };
      mockRequest.http.get.resolves({
        status: 200,
        data: responseData
      });

      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse, nextStub);

      expect(mockRequest.http.get).to.have.been.calledWith(
        'https://different-prd-api.gov.uk/refdata/commondata/lov/categories/category-456?isChildRequired=false'
      );
    });

    it('should handle empty query parameters', async () => {
      mockRequest.query = {};
      const responseData = { list_of_values: [] };
      mockRequest.http.get.resolves({
        status: 200,
        data: responseData
      });

      const handler = router.stack[0].route.stack[0].handle;
      await handler(mockRequest, mockResponse, nextStub);

      expect(mockRequest.http.get).to.have.been.calledWith(
        'https://prd-commondata-api.example.com/refdata/commondata/lov/categories/undefined?isChildRequired=undefined'
      );
    });
  });

  describe('module exports', () => {
    it('should export router and getLovRefData function', () => {
      const module = require('./index');
      expect(module.router).to.exist;
      expect(module.getLovRefData).to.exist;
      expect(module.default).to.exist;
    });

    it('should have GET route configured for /', () => {
      const module = require('./index');
      const router = module.router;

      expect(router).to.be.a('function');
      expect(router.stack).to.be.an('array');
      expect(router.stack).to.have.length(1);
    });
  });
});
