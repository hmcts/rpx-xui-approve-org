import { expect } from '../test/shared/testSetup';
import 'mocha';
import { setHeaders } from './proxy';
import { EnhancedRequest } from './models';

describe('lib/proxy', () => {
  describe('setHeaders', () => {
    it('should return empty object when request has no headers', () => {
      const mockRequest = {} as EnhancedRequest;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({});
    });

    it('should include content-type header when present', () => {
      const mockRequest = {
        headers: {
          'content-type': 'application/json'
        }
      } as EnhancedRequest;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({
        'content-type': 'application/json'
      });
    });

    it('should include accept header when present', () => {
      const mockRequest = {
        headers: {
          accept: 'application/json'
        }
      } as EnhancedRequest;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({
        accept: 'application/json'
      });
    });

    it('should include experimental header when present', () => {
      const mockRequest = {
        headers: {
          experimental: 'true'
        }
      } as EnhancedRequest;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({
        experimental: 'true'
      });
    });

    it('should include Authorization header when present', () => {
      const mockRequest = {
        headers: {
          Authorization: 'Bearer test-token'
        }
      } as EnhancedRequest;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({
        Authorization: 'Bearer test-token'
      });
    });

    it('should include ServiceAuthorization header when present', () => {
      const mockRequest = {
        headers: {
          ServiceAuthorization: 'Bearer s2s-token'
        }
      } as EnhancedRequest;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({
        ServiceAuthorization: 'Bearer s2s-token'
      });
    });

    it('should include user-roles header when present and not empty', () => {
      const mockRequest = {
        headers: {
          'user-roles': ['admin', 'user']
        }
      } as any;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({
        'user-roles': ['admin', 'user']
      });
    });

    it('should exclude user-roles header when empty array', () => {
      const mockRequest = {
        headers: {
          'user-roles': []
        }
      } as any;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({});
    });

    it('should include all supported headers when present', () => {
      const mockRequest = {
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          experimental: 'true',
          Authorization: 'Bearer test-token',
          ServiceAuthorization: 'Bearer s2s-token',
          'user-roles': ['admin']
        }
      } as any;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({
        'content-type': 'application/json',
        accept: 'application/json',
        experimental: 'true',
        Authorization: 'Bearer test-token',
        ServiceAuthorization: 'Bearer s2s-token',
        'user-roles': ['admin']
      });
    });

    it('should exclude unsupported headers', () => {
      const mockRequest = {
        headers: {
          'content-type': 'application/json',
          'x-custom-header': 'custom-value',
          'user-agent': 'Mozilla/5.0',
          'cache-control': 'no-cache',
          Authorization: 'Bearer test-token'
        }
      } as any;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({
        'content-type': 'application/json',
        Authorization: 'Bearer test-token'
      });
    });

    it('should handle headers with falsy values', () => {
      const mockRequest = {
        headers: {
          'content-type': '',
          accept: null,
          experimental: false,
          Authorization: undefined
        }
      } as any;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({});
    });

    it('should handle case sensitivity in header names', () => {
      const mockRequest = {
        headers: {
          'Content-Type': 'application/json',
          'ACCEPT': 'text/html',
          authorization: 'Bearer lowercase-token'
        }
      } as any;

      const result = setHeaders(mockRequest);

      // Only exact case matches should be included based on the implementation
      expect(result).to.deep.equal({});
    });

    it('should handle mixed case user-roles header', () => {
      const mockRequest = {
        headers: {
          'user-roles': ['Admin', 'USER', 'editor']
        }
      } as any;

      const result = setHeaders(mockRequest);

      expect(result).to.deep.equal({
        'user-roles': ['Admin', 'USER', 'editor']
      });
    });
  });
});
