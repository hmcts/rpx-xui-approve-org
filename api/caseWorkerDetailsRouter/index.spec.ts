import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockEnhancedRequest, createMockResponse } from '../test/shared/authMocks';

describe('caseWorkerDetailsRouter/index', () => {
  let mockRequest: any;
  let mockResponse: any;
  let configStub: any;
  let utilStub: any;

  beforeEach(() => {
    mockRequest = createMockEnhancedRequest();
    mockResponse = createMockResponse();
    configStub = sinon.stub().returns('https://case-worker-api.example.com');

    utilStub = {
      getFormData: sinon.stub(),
      getHeaders: sinon.stub(),
      getUploadFileUrl: sinon.stub()
    };

    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('caseWorkerDetailsRoute', () => {
    let router: any;

    beforeEach(() => {
      sinon.stub(require('./util'), 'getFormData').callsFake(utilStub.getFormData);
      sinon.stub(require('./util'), 'getHeaders').callsFake(utilStub.getHeaders);
      sinon.stub(require('./util'), 'getUploadFileUrl').callsFake(utilStub.getUploadFileUrl);

      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should upload file successfully', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'caseworkers.xlsx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024,
        buffer: Buffer.from('mock file content')
      };
      mockRequest.file = mockFile;

      const mockFormData = { append: sinon.stub() };
      const mockHeaders = { headers: { 'Content-Type': 'multipart/form-data; boundary=test' } };
      const uploadUrl = 'https://case-worker-api.example.com/refdata/case-worker/upload-file';

      utilStub.getFormData.returns(mockFormData);
      utilStub.getHeaders.returns(mockHeaders);
      utilStub.getUploadFileUrl.returns(uploadUrl);

      const responseData = { message: 'File uploaded successfully', count: 5 };
      mockRequest.http.post.resolves({ status: 201, data: responseData });

      // The route stack includes multer middleware, so we need to get the actual handler
      const handler = router.stack[0].route.stack[1].handle; // Skip multer middleware
      await handler(mockRequest, mockResponse);

      expect(configStub).to.have.been.calledWith('services.caseworkerApi');
      expect(utilStub.getFormData).to.have.been.calledWith(mockFile);
      expect(utilStub.getHeaders).to.have.been.calledWith(mockFormData);
      expect(utilStub.getUploadFileUrl).to.have.been.calledWith('https://case-worker-api.example.com');
      expect(mockRequest.http.post).to.have.been.calledWith(uploadUrl, mockFormData, mockHeaders);
      expect(mockResponse.status).to.have.been.calledWith(201);
      expect(mockResponse.send).to.have.been.calledWith(responseData);
    });

    it('should handle missing file', async () => {
      mockRequest.file = null;

      const handler = router.stack[0].route.stack[1].handle; // Skip multer middleware
      await handler(mockRequest, mockResponse);

      expect(mockResponse.status).to.have.been.calledWith(400);
      expect(mockResponse.send).to.have.been.calledWith('You need to select a file to upload. Please try again.');
      expect(mockRequest.http.post).not.to.have.been.called;
    });

    it('should handle undefined file', async () => {
      mockRequest.file = undefined;

      const handler = router.stack[0].route.stack[1].handle; // Skip multer middleware
      await handler(mockRequest, mockResponse);

      expect(mockResponse.status).to.have.been.calledWith(400);
      expect(mockResponse.send).to.have.been.calledWith('You need to select a file to upload. Please try again.');
    });

    it('should handle upload errors with status and data', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'invalid.txt',
        buffer: Buffer.from('invalid content')
      };
      mockRequest.file = mockFile;

      const mockFormData = { append: sinon.stub() };
      const mockHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };
      const uploadUrl = 'https://case-worker-api.example.com/refdata/case-worker/upload-file';

      utilStub.getFormData.returns(mockFormData);
      utilStub.getHeaders.returns(mockHeaders);
      utilStub.getUploadFileUrl.returns(uploadUrl);

      const error = {
        status: 400,
        data: { message: 'Invalid file format' }
      };
      mockRequest.http.post.rejects(error);

      const handler = router.stack[0].route.stack[1].handle; // Skip multer middleware
      await handler(mockRequest, mockResponse);

      expect(mockResponse.status).to.have.been.calledWith(400);
      expect(mockResponse.send).to.have.been.calledWith({ message: 'Invalid file format' });
    });

    it('should handle upload errors with only status', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.xlsx',
        buffer: Buffer.from('test content')
      };
      mockRequest.file = mockFile;

      const mockFormData = { append: sinon.stub() };
      const mockHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };
      utilStub.getFormData.returns(mockFormData);
      utilStub.getHeaders.returns(mockHeaders);
      utilStub.getUploadFileUrl.returns('https://case-worker-api.example.com/refdata/case-worker/upload-file');

      const error = {
        status: 500
        // No data property
      };
      mockRequest.http.post.rejects(error);

      const handler = router.stack[0].route.stack[1].handle; // Skip multer middleware
      await handler(mockRequest, mockResponse);

      expect(mockResponse.status).to.have.been.calledOnce;
      expect(mockResponse.status).to.have.been.calledWith(500);
      // When there's no error data, no response body is sent (per implementation)
      expect(mockResponse.send).not.to.have.been.called;
    });

    it('should handle upload errors with only data', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.xlsx',
        buffer: Buffer.from('test content')
      };
      mockRequest.file = mockFile;

      const mockFormData = { append: sinon.stub() };
      const mockHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };
      utilStub.getFormData.returns(mockFormData);
      utilStub.getHeaders.returns(mockHeaders);
      utilStub.getUploadFileUrl.returns('https://case-worker-api.example.com/refdata/case-worker/upload-file');

      const error = {
        data: { message: 'Server error' }
        // No status property
      };
      mockRequest.http.post.rejects(error);

      const handler = router.stack[0].route.stack[1].handle; // Skip multer middleware
      await handler(mockRequest, mockResponse);

      expect(mockResponse.status).not.to.have.been.called;
      expect(mockResponse.send).to.have.been.calledWith({ message: 'Server error' });
    });

    it('should handle errors with neither status nor data', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.xlsx',
        buffer: Buffer.from('test content')
      };
      mockRequest.file = mockFile;

      const mockFormData = { append: sinon.stub() };
      const mockHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };
      utilStub.getFormData.returns(mockFormData);
      utilStub.getHeaders.returns(mockHeaders);
      utilStub.getUploadFileUrl.returns('https://case-worker-api.example.com/refdata/case-worker/upload-file');

      const error = new Error('Generic error');
      mockRequest.http.post.rejects(error);

      const handler = router.stack[0].route.stack[1].handle; // Skip multer middleware
      await handler(mockRequest, mockResponse);

      // Per implementation: when error has no status or data properties,
      // no response is sent (this matches the actual code behavior)
      expect(mockResponse.status).not.to.have.been.called;
      expect(mockResponse.send).not.to.have.been.called;
      
      expect(mockRequest.http.post).to.have.been.calledOnce;
    });

    it('should use different case worker API URL', async () => {
      configStub.returns('https://different-api.gov.uk');
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.xlsx',
        buffer: Buffer.from('test content')
      };
      mockRequest.file = mockFile;

      const mockFormData = { append: sinon.stub() };
      const mockHeaders = { headers: { 'Content-Type': 'multipart/form-data' } };
      const expectedUploadUrl = 'https://different-api.gov.uk/refdata/case-worker/upload-file';
      
      utilStub.getFormData.returns(mockFormData);
      utilStub.getHeaders.returns(mockHeaders);
      utilStub.getUploadFileUrl.returns(expectedUploadUrl);

      const responseData = { message: 'Success' };
      mockRequest.http.post.resolves({ status: 200, data: responseData });

      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;

      const handler = router.stack[0].route.stack[1].handle; // Skip multer middleware
      await handler(mockRequest, mockResponse);

      expect(configStub).to.have.been.calledWith('services.caseworkerApi');
      
      expect(utilStub.getUploadFileUrl).to.have.been.calledOnce;
      expect(utilStub.getUploadFileUrl).to.have.been.calledWith('https://different-api.gov.uk');
      
      expect(mockRequest.http.post).to.have.been.calledOnce;
      expect(mockRequest.http.post).to.have.been.calledWith(expectedUploadUrl, mockFormData, mockHeaders);
      
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledWith(responseData);
    });
  });

  describe('module exports', () => {
    it('should export router', () => {
      const module = require('./index');
      
      expect(module.router).to.exist;
      expect(module.router).to.be.a('function');
      expect(module.router.stack).to.be.an('array');
      
      expect(module.default).to.exist;
      expect(module.default).to.equal(module.router);
    });

    it('should have POST route configured for / with file upload middleware', () => {
      const module = require('./index');
      const router = module.router;
      
      // Verify router has exactly one route
      expect(router.stack).to.have.length(1);
      
      const route = router.stack[0];
      expect(route.route).to.exist;
      expect(route.route.path).to.equal('/');
      expect(route.route.methods.post).to.be.true;
      expect(route.route.methods.get).to.be.undefined;
      
      // Verify the route has middleware stack with multer and handler
      expect(route.route.stack).to.have.length(2);
      
      // First middleware should be multer (upload.single('file'))
      const multerMiddleware = route.route.stack[0];
      expect(multerMiddleware.handle).to.be.a('function');
      expect(multerMiddleware.name).to.equal('multerMiddleware');
      
      // Second should be the actual route handler
      const routeHandler = route.route.stack[1];
      expect(routeHandler.handle).to.be.a('function');
      expect(routeHandler.handle.name).to.equal('caseWorkerDetailsRoute');
    });
  });
});