import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { getUserDetails } from './idam';
import { createMockAxiosInstance } from '../test/shared/httpMocks';

describe('services/idam', () => {
  let httpStub: any;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = createMockAxiosInstance();
    httpStub = sinon.stub().returns(mockAxiosInstance);

    sinon.stub(require('../lib/http'), 'http').callsFake(httpStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getUserDetails', () => {
    it('should call IDAM user details endpoint with correct parameters', async () => {
      const jwt = 'test.jwt.token';
      const url = 'https://idam-api.example.com';
      const mockResponse = {
        data: {
          id: 'user123',
          email: 'user@example.com',
          roles: ['citizen']
        },
        status: 200
      };

      mockAxiosInstance.get.resolves(mockResponse);

      const result = await getUserDetails(jwt, url);

      expect(httpStub).to.have.been.calledWith({
        session: {
          auth: {
            token: jwt
          }
        }
      });

      expect(mockAxiosInstance.get).to.have.been.calledWith(
        'https://idam-api.example.com/details',
        {
          headers: { Authorization: 'Bearer test.jwt.token' }
        }
      );

      expect(result).to.equal(mockResponse);
    });

    it('should handle different JWT tokens', async () => {
      const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test';
      const url = 'https://idam-api.example.com';

      mockAxiosInstance.get.resolves({ data: 'success' });

      await getUserDetails(jwt, url);

      expect(mockAxiosInstance.get).to.have.been.calledWith(
        'https://idam-api.example.com/details',
        {
          headers: { Authorization: `Bearer ${jwt}` }
        }
      );
    });

    it('should handle different IDAM URLs', async () => {
      const jwt = 'test-token';
      const url = 'https://different-idam.gov.uk';

      mockAxiosInstance.get.resolves({ data: 'success' });

      await getUserDetails(jwt, url);

      expect(mockAxiosInstance.get).to.have.been.calledWith(
        'https://different-idam.gov.uk/details',
        {
          headers: { Authorization: 'Bearer test-token' }
        }
      );
    });

    it('should create HTTP client with correct request structure', async () => {
      const jwt = 'test-jwt-token';
      const url = 'https://idam.example.com';

      mockAxiosInstance.get.resolves({ data: 'test' });

      await getUserDetails(jwt, url);

      // Verify the request structure passed to http()
      const httpCall = httpStub.getCall(0);
      const requestObj = httpCall.args[0];

      expect(requestObj).to.have.nested.property('session.auth.token', jwt);
    });

    it('should propagate axios response exactly', async () => {
      const jwt = 'token123';
      const url = 'https://idam.test.com';
      const expectedResponse = {
        data: { userId: '12345', name: 'Test User' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: {}
      };

      mockAxiosInstance.get.resolves(expectedResponse);

      const result = await getUserDetails(jwt, url);

      expect(result).to.deep.equal(expectedResponse);
    });

    it('should handle axios rejection', async () => {
      const jwt = 'test-token';
      const url = 'https://idam.example.com';
      const error = new Error('Network error');

      mockAxiosInstance.get.rejects(error);

      try {
        await getUserDetails(jwt, url);
        expect.fail('Expected function to throw');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });

    it('should handle empty JWT token', async () => {
      const jwt = '';
      const url = 'https://idam.example.com';

      mockAxiosInstance.get.resolves({ data: 'success' });

      await getUserDetails(jwt, url);

      expect(mockAxiosInstance.get).to.have.been.calledWith(
        'https://idam.example.com/details',
        {
          headers: { Authorization: 'Bearer ' }
        }
      );
    });

    it('should handle URL without trailing slash', async () => {
      const jwt = 'test-token';
      const url = 'https://idam.example.com/api/v1';

      mockAxiosInstance.get.resolves({ data: 'success' });

      await getUserDetails(jwt, url);

      expect(mockAxiosInstance.get).to.have.been.calledWith(
        'https://idam.example.com/api/v1/details',
        sinon.match.any
      );
    });
  });
});
