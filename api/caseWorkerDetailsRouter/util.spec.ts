import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as FormData from 'form-data';

describe('caseWorkerDetailsRouter/util', () => {
  describe('constants and interfaces', () => {
    let util: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./util')];
      util = require('./util');
    });

    it('should export fieldName as "file"', () => {
      expect(util.fieldName).to.equal('file');
    });

    it('should export multipartFormData constant', () => {
      expect(util.multipartFormData).to.equal('multipart/form-data');
    });
  });

  describe('getContentType function', () => {
    let getContentType: any;
    let mockFormData: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./util')];
      const util = require('./util');
      getContentType = util.getContentType;
      
      mockFormData = {
        getBoundary: () => 'test-boundary-123'
      };
    });

    it('should return content type with boundary', () => {
      const result = getContentType('multipart/form-data', mockFormData);
      expect(result).to.equal('multipart/form-data; boundary=test-boundary-123');
    });

    it('should work with different content types', () => {
      const result = getContentType('application/form-data', mockFormData);
      expect(result).to.equal('application/form-data; boundary=test-boundary-123');
    });

    it('should work with different boundaries', () => {
      mockFormData.getBoundary = () => 'different-boundary-456';
      const result = getContentType('multipart/form-data', mockFormData);
      expect(result).to.equal('multipart/form-data; boundary=different-boundary-456');
    });
  });

  describe('getFormData function', () => {
    let getFormData: any;
    let fieldName: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./util')];
      const util = require('./util');
      getFormData = util.getFormData;
      fieldName = util.fieldName;
    });

    it('should create FormData with file buffer and original name', () => {
      const mockFile = {
        buffer: Buffer.from('test file content'),
        originalname: 'test.xlsx',
        fieldname: 'file',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024,
        stream: null,
        destination: '/tmp',
        filename: 'test.xlsx',
        path: '/tmp/test.xlsx'
      };

      const result = getFormData(mockFile);
      
      expect(result).to.be.instanceOf(FormData);
      expect(result.getBoundary()).to.be.a('string');
      expect(result.getBoundary()).to.have.lengthOf.greaterThan(0);
      
      const headers = result.getHeaders();
      expect(headers).to.have.property('content-type');
      expect(headers['content-type']).to.include('multipart/form-data');
      expect(headers['content-type']).to.include(result.getBoundary());
    });

    it('should work with different file names', () => {
      const mockFile = {
        buffer: Buffer.from('different content'),
        originalname: 'different-file.xlsx',
        fieldname: 'file',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 2048,
        stream: null,
        destination: '/tmp',
        filename: 'different-file.xlsx',
        path: '/tmp/different-file.xlsx'
      };

      const result = getFormData(mockFile);
      
      expect(result).to.be.instanceOf(FormData);
      expect(result.getBoundary()).to.be.a('string');
      expect(result.getBoundary()).to.have.lengthOf.greaterThan(0);
      
      const headers = result.getHeaders();
      expect(headers).to.have.property('content-type');
      expect(headers['content-type']).to.include('multipart/form-data');
      expect(headers['content-type']).to.include(result.getBoundary());
    });

    it('should handle empty file buffer', () => {
      const mockFile = {
        buffer: Buffer.alloc(0),
        originalname: 'empty.xlsx',
        fieldname: 'file',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 0,
        stream: null,
        destination: '/tmp',
        filename: 'empty.xlsx',
        path: '/tmp/empty.xlsx'
      };

      const result = getFormData(mockFile);
      
      expect(result).to.be.instanceOf(FormData);
      expect(result.getBoundary()).to.be.a('string');
      expect(result.getBoundary()).to.have.lengthOf.greaterThan(0);
    });
  });

  describe('getHeaders function', () => {
    let getHeaders: any;
    let getContentType: any;
    let multipartFormData: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./util')];
      const util = require('./util');
      getHeaders = util.getHeaders;
      getContentType = util.getContentType;
      multipartFormData = util.multipartFormData;
    });

    it('should return headers object with Content-Type', () => {
      const mockFormData = {
        getBoundary: () => 'test-boundary-123'
      };

      const result = getHeaders(mockFormData);
      
      expect(result).to.deep.equal({
        headers: { 'Content-Type': 'multipart/form-data; boundary=test-boundary-123' }
      });
    });

    it('should work with different boundaries', () => {
      const mockFormData = {
        getBoundary: () => 'different-boundary-456'
      };

      const result = getHeaders(mockFormData);
      
      expect(result).to.deep.equal({
        headers: { 'Content-Type': 'multipart/form-data; boundary=different-boundary-456' }
      });
      expect(result.headers['Content-Type']).to.match(/^multipart\/form-data; boundary=.+$/);
    });

    it('should handle FormData with complex boundary strings', () => {
      const complexBoundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const mockFormData = {
        getBoundary: () => complexBoundary
      };

      const result = getHeaders(mockFormData);
      
      expect(result).to.have.property('headers');
      expect(result.headers).to.have.property('Content-Type');
      expect(result.headers['Content-Type']).to.equal(`multipart/form-data; boundary=${complexBoundary}`);
    });
  });

  describe('getUploadFileUrl function', () => {
    let getUploadFileUrl: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./util')];
      const util = require('./util');
      getUploadFileUrl = util.getUploadFileUrl;
    });

    it('should append upload-file endpoint to base URL', () => {
      const baseUrl = 'http://rd-professional.example.com';
      const result = getUploadFileUrl(baseUrl);
      
      expect(result).to.equal('http://rd-professional.example.com/refdata/case-worker/upload-file');
    });

    it('should work with different base URLs', () => {
      const baseUrl = 'https://api.example.org/v1';
      const result = getUploadFileUrl(baseUrl);
      
      expect(result).to.equal('https://api.example.org/v1/refdata/case-worker/upload-file');
    });

    it('should handle URLs without protocol', () => {
      const baseUrl = 'localhost:3000';
      const result = getUploadFileUrl(baseUrl);
      
      expect(result).to.equal('localhost:3000/refdata/case-worker/upload-file');
    });

    it('should handle empty base URL', () => {
      const baseUrl = '';
      const result = getUploadFileUrl(baseUrl);
      
      expect(result).to.equal('/refdata/case-worker/upload-file');
    });

    it('should handle base URL with only slash', () => {
      const baseUrl = '/';
      const result = getUploadFileUrl(baseUrl);
      
      expect(result).to.equal('//refdata/case-worker/upload-file');
    });
  });
});