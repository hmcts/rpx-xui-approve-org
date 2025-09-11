import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockEnhancedRequest, createMockResponse } from '../test/shared/authMocks';

describe('updatePba/index', () => {
  let mockRequest: any;
  let mockResponse: any;
  let configStub: any;
  let consoleErrorStub: any;

  beforeEach(() => {
    mockRequest = createMockEnhancedRequest();
    mockResponse = createMockResponse();
    configStub = sinon.stub().returns('https://rd-professional-api.example.com');
    consoleErrorStub = sinon.stub(console, 'error');

    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('handleUpdatePBARoute', () => {
    let handleUpdatePBARoute: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      handleUpdatePBARoute = module.handleUpdatePBARoute;
    });

    it('should update PBA accounts successfully', async () => {
      mockRequest.body = {
        orgId: 'org-123',
        paymentAccounts: ['PBA123456', 'PBA789012']
      };
      mockRequest.http.put.resolves();

      await handleUpdatePBARoute(mockRequest, mockResponse);

      expect(configStub).to.have.been.calledWith('services.rdProfessionalApi');
      expect(mockRequest.http.put).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/org-123/pbas',
        { paymentAccounts: ['PBA123456', 'PBA789012'] }
      );
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledWith();
    });

    it('should handle update errors', async () => {
      mockRequest.body = {
        orgId: 'org-123',
        paymentAccounts: ['PBA123456']
      };
      const error = {
        status: 400,
        data: { message: 'Invalid PBA number' }
      };
      mockRequest.http.put.rejects(error);

      await handleUpdatePBARoute(mockRequest, mockResponse);

      expect(consoleErrorStub).to.have.been.calledWith(error);
      expect(mockResponse.status).to.have.been.calledWith(400);
      expect(mockResponse.send).to.have.been.calledWith({ message: 'Invalid PBA number' });
    });

    it('should handle different organisation IDs', async () => {
      mockRequest.body = {
        orgId: 'different-org-456',
        paymentAccounts: ['PBA999999']
      };
      mockRequest.http.put.resolves();

      await handleUpdatePBARoute(mockRequest, mockResponse);

      expect(mockRequest.http.put).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/different-org-456/pbas',
        { paymentAccounts: ['PBA999999'] }
      );
    });

    it('should handle empty payment accounts', async () => {
      mockRequest.body = {
        orgId: 'org-123',
        paymentAccounts: []
      };
      mockRequest.http.put.resolves();

      await handleUpdatePBARoute(mockRequest, mockResponse);

      expect(mockRequest.http.put).to.have.been.calledWith(
        sinon.match.string,
        { paymentAccounts: [] }
      );
    });
  });

  describe('handleSetStatusPBARoute', () => {
    let handleSetStatusPBARoute: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      handleSetStatusPBARoute = module.handleSetStatusPBARoute;
    });

    it('should set PBA status successfully', async () => {
      mockRequest.body = {
        orgId: 'org-123',
        pbaNumbers: [
          { pbaNumber: 'PBA123456', status: 'ACCEPTED' },
          { pbaNumber: 'PBA789012', status: 'PENDING' }
        ]
      };
      mockRequest.http.put.resolves();

      await handleSetStatusPBARoute(mockRequest, mockResponse);

      expect(mockRequest.http.put).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/org-123/pba/status',
        { pbaNumbers: mockRequest.body.pbaNumbers }
      );
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledWith();
    });

    it('should handle set status errors', async () => {
      mockRequest.body = {
        orgId: 'org-123',
        pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'INVALID_STATUS' }]
      };
      const error = {
        status: 422,
        data: { message: 'Invalid status' }
      };
      mockRequest.http.put.rejects(error);

      await handleSetStatusPBARoute(mockRequest, mockResponse);

      expect(consoleErrorStub).to.have.been.calledWith(error);
      expect(mockResponse.status).to.have.been.calledWith(422);
      expect(mockResponse.send).to.have.been.calledWith({ message: 'Invalid status' });
    });
  });

  describe('handleGetPBAsByStatusRoute', () => {
    let handleGetPBAsByStatusRoute: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      handleGetPBAsByStatusRoute = module.handleGetPBAsByStatusRoute;
    });

    it('should get PBAs by status successfully', async () => {
      mockRequest.params = { status: 'PENDING' };
      const responseData = [
        { organisationName: 'Org 1', pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'PENDING' }] },
        { organisationName: 'Org 2', pbaNumbers: [{ pbaNumber: 'PBA789012', status: 'PENDING' }] }
      ];
      mockRequest.http.get.resolves({ status: 200, data: responseData });

      await handleGetPBAsByStatusRoute(mockRequest, mockResponse);

      expect(mockRequest.http.get).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/pba/PENDING'
      );
      expect(mockResponse.status).to.have.been.calledWith(200);
      expect(mockResponse.send).to.have.been.calledWith(responseData);
    });

    it('should handle different status values', async () => {
      mockRequest.params = { status: 'ACCEPTED' };
      const responseData = [];
      mockRequest.http.get.resolves({ status: 200, data: responseData });

      await handleGetPBAsByStatusRoute(mockRequest, mockResponse);

      expect(mockRequest.http.get).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/pba/ACCEPTED'
      );
    });

    it('should handle get errors', async () => {
      mockRequest.params = { status: 'PENDING' };
      const error = {
        status: 404,
        data: { message: 'Not found' }
      };
      mockRequest.http.get.rejects(error);

      await handleGetPBAsByStatusRoute(mockRequest, mockResponse);

      expect(consoleErrorStub).to.have.been.calledWith(error);
      expect(mockResponse.status).to.have.been.calledWith(404);
      expect(mockResponse.send).to.have.been.calledWith({ message: 'Not found' });
    });
  });

  describe('handlePostPBAsByStatusRoute', () => {
    let handlePostPBAsByStatusRoute: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      handlePostPBAsByStatusRoute = module.handlePostPBAsByStatusRoute;
    });

    it('should get paginated PBAs with empty search filter', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: ''
        }
      };
      const apiResponseData = [
        {
          organisationName: 'Test Org 1',
          superUser: { email: 'test@example.com' }
        },
        {
          organisationName: 'Another Org',
          superUser: { email: 'other@example.com' }
        }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      expect(mockRequest.http.get).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/pba/PENDING'
      );
      expect(mockResponse.status).to.have.been.called;
      expect(mockResponse.send).to.have.been.called;
      // Should return all organisations when no search filter is applied
      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg).to.have.property('organisations');
      expect(responseArg).to.have.property('total_records');
    });

    it('should handle empty search filter', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: ''
        }
      };
      const apiResponseData = [
        { organisationName: 'Org 1', pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'PENDING' }] }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(1);
      expect(responseArg.total_records).to.equal(1);
    });

    it('should handle drill down search filters', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: '',
          drill_down_search: [
            { field_name: 'pbaPendings', search_filter: 'PBA123' }
          ]
        }
      };
      const apiResponseData = [
        {
          organisationName: 'Org 1',
          pbaNumbers: [{ pbaNumber: 'PBA123456', status: 'PENDING' }]
        },
        {
          organisationName: 'Org 2',
          pbaNumbers: [{ pbaNumber: 'PBA789012', status: 'PENDING' }]
        }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg).to.have.property('organisations');
      expect(responseArg).to.have.property('total_records');
    });

    it('should handle null data response', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: ''
        }
      };
      mockRequest.http.get.resolves({ status: 200, data: null });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg).to.deep.equal({ organisations: [], total_records: 0 });
    });

    it('should handle pagination correctly', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 2, page_size: 1 },
          search_filter: ''
        }
      };
      const apiResponseData = [
        { organisationName: 'Org 1' },
        { organisationName: 'Org 2' },
        { organisationName: 'Org 3' }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(1);
      expect(responseArg.organisations[0].organisationName).to.equal('Org 2');
      expect(responseArg.total_records).to.equal(3);
    });

    it('should handle post errors', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: ''
        }
      };
      const error = {
        status: 500,
        data: { message: 'Server error' }
      };
      mockRequest.http.get.rejects(error);

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      expect(consoleErrorStub).to.have.been.calledWith(error);
      expect(mockResponse.status).to.have.been.calledWith(500);
      expect(mockResponse.send).to.have.been.calledWith({ message: 'Server error' });
    });
  });

  describe('filtering and pagination functions', () => {
    let handlePostPBAsByStatusRoute: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      handlePostPBAsByStatusRoute = module.handlePostPBAsByStatusRoute;
    });

    it('should return all organisations when no filter applied', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: ''
        }
      };
      const apiResponseData = [
        { organisationName: 'Legal Services Ltd', superUser: { email: 'admin@legal.com' } },
        { organisationName: 'Tech Corp', superUser: { email: 'admin@tech.com' } },
        { organisationName: 'Another Legal Services', superUser: { email: 'admin@legal2.com' } }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(3);
      expect(responseArg.total_records).to.equal(3);
    });

    it('should filter by organisation name', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: 'legal'
        }
      };
      const apiResponseData = [
        { organisationName: 'Legal Services Ltd', superUser: { email: 'admin@legal.com' } },
        { organisationName: 'Tech Corp', superUser: { email: 'admin@tech.com' } },
        { organisationName: 'Another Legal Services', superUser: { email: 'admin@legal2.com' } }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(2);
    });

    it('should filter by superUser email', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: 'tech'
        }
      };
      const apiResponseData = [
        { organisationName: 'Org 1', superUser: { email: 'admin@legal.com' } },
        { organisationName: 'Org 2', superUser: { email: 'admin@tech.com' } },
        { organisationName: 'Org 3', superUser: { email: 'admin@legal2.com' } }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(1); // Should match admin@tech.com
    });

    it('should filter by PBA number', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: 'pba123'
        }
      };
      const apiResponseData = [
        {
          organisationName: 'Org 1',
          pbaNumbers: [{ pbaNumber: 'PBA123456' }],
          superUser: { email: 'admin@org1.com' }
        },
        {
          organisationName: 'Org 2',
          pbaNumbers: [{ pbaNumber: 'PBA789012' }],
          superUser: { email: 'admin@org2.com' }
        }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(1); // Should match PBA123456
    });

    it('should filter by superUser full name', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: 'john doe'
        }
      };
      const apiResponseData = [
        {
          organisationName: 'Org 1',
          superUser: { firstName: 'John', lastName: 'Doe', email: 'john@org1.com' }
        },
        {
          organisationName: 'Org 2',
          superUser: { firstName: 'Jane', lastName: 'Smith', email: 'jane@org2.com' }
        }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(1); // Should match "John Doe"
    });

    it('should filter by organisation status', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: 'active'
        }
      };
      const apiResponseData = [
        {
          organisationName: 'Org 1',
          status: 'ACTIVE',
          superUser: { email: 'admin@org1.com' }
        },
        {
          organisationName: 'Org 2',
          status: 'PENDING',
          superUser: { email: 'admin@org2.com' }
        }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(1); // Should match status 'ACTIVE'
    });

    it('should handle organisations without pbaNumbers', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: 'org1'
        }
      };
      const apiResponseData = [
        {
          organisationName: 'Org 1 Without PBAs',
          superUser: { email: 'admin@org1.com' }
          // No pbaNumbers property
        }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(1);
    });

    it('should handle organisations without superUser', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: 'minimal'
        }
      };
      const apiResponseData = [
        {
          organisationName: 'Minimal Org'
          // No superUser property
        }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg).to.have.property('organisations');
      expect(responseArg).to.have.property('total_records');
    });

    it('should handle complex drill-down filters with PBA matching', async () => {
      mockRequest.params = { status: 'PENDING' };
      mockRequest.body = {
        searchRequest: {
          pagination_parameters: { page_number: 1, page_size: 10 },
          search_filter: '',
          drill_down_search: [
            { field_name: 'pbaPendings', search_filter: 'PBA123' }
          ]
        }
      };
      const apiResponseData = [
        {
          organisationName: 'Org with matching PBA',
          pbaNumbers: [{ pbaNumber: 'PBA123456' }],
          superUser: { email: 'admin@matching.com' }
        },
        {
          organisationName: 'Org with non-matching PBA',
          pbaNumbers: [{ pbaNumber: 'PBA789012' }],
          superUser: { email: 'admin@non-matching.com' }
        }
      ];
      mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

      await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

      const responseArg = mockResponse.send.getCall(0).args[0];
      expect(responseArg.organisations).to.have.length(1); // Should match PBA123 pattern
    });
  });

  describe('URL utility functions', () => {
    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
    });

    it('should create correct PUT update URL', async () => {
      const mockRequest = createMockEnhancedRequest();
      mockRequest.body = { orgId: 'test-org-123', paymentAccounts: ['PBA123456'] };
      mockRequest.http.put.resolves();

      const module = require('./index');
      await module.handleUpdatePBARoute(mockRequest, createMockResponse());

      expect(mockRequest.http.put).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/test-org-123/pbas',
        sinon.match.any
      );
    });

    it('should create correct PUT status URL', async () => {
      const mockRequest = createMockEnhancedRequest();
      mockRequest.body = { orgId: 'status-org-456', pbaNumbers: [] };
      mockRequest.http.put.resolves();

      const module = require('./index');
      await module.handleSetStatusPBARoute(mockRequest, createMockResponse());

      expect(mockRequest.http.put).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/status-org-456/pba/status',
        sinon.match.any
      );
    });

    it('should create correct GET by status URL', async () => {
      const mockRequest = createMockEnhancedRequest();
      mockRequest.params = { status: 'ACCEPTED' };
      mockRequest.http.get.resolves({ status: 200, data: [] });

      const module = require('./index');
      await module.handleGetPBAsByStatusRoute(mockRequest, createMockResponse());

      expect(mockRequest.http.get).to.have.been.calledWith(
        'https://rd-professional-api.example.com/refdata/internal/v1/organisations/pba/ACCEPTED'
      );
    });
  });

  describe('Error handling edge cases', () => {
    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      consoleErrorStub = sinon.stub(console, 'error');
    });

    it('should handle error without status code in updatePBA', async () => {
      const mockRequest = createMockEnhancedRequest();
      const mockResponse = createMockResponse();
      mockRequest.body = { orgId: 'org-123', paymentAccounts: ['PBA123456'] };

      const errorWithoutStatus = new Error('Network error');
      mockRequest.http.put.rejects(errorWithoutStatus);

      const module = require('./index');
      await module.handleUpdatePBARoute(mockRequest, mockResponse);

      expect(consoleErrorStub).to.have.been.calledWith(errorWithoutStatus);
      expect(mockResponse.status).to.have.been.calledWith(undefined);
    });

    it('should handle error without data in setStatus', async () => {
      const mockRequest = createMockEnhancedRequest();
      const mockResponse = createMockResponse();
      mockRequest.body = { orgId: 'org-123', pbaNumbers: [] };

      const errorWithoutData = { status: 400 };
      mockRequest.http.put.rejects(errorWithoutData);

      const module = require('./index');
      await module.handleSetStatusPBARoute(mockRequest, mockResponse);

      expect(mockResponse.status).to.have.been.calledWith(400);
      expect(mockResponse.send).to.have.been.calledWith(undefined);
    });

    it('should handle error in getByStatus with partial error object', async () => {
      const mockRequest = createMockEnhancedRequest();
      const mockResponse = createMockResponse();
      mockRequest.params = { status: 'PENDING' };

      const partialError = { status: 503 };
      mockRequest.http.get.rejects(partialError);

      const module = require('./index');
      await module.handleGetPBAsByStatusRoute(mockRequest, mockResponse);

      expect(mockResponse.status).to.have.been.calledWith(503);
      expect(mockResponse.send).to.have.been.calledWith(undefined);
    });
  });

  describe('Individual utility functions', () => {
    let indexModule: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      indexModule = require('./index');
    });

    describe('URL building functions', () => {
      it('should test putUpdateUrl function directly', () => {
        // Since these functions are not exported, we need to test them through the route handlers
        // But we can verify the URLs are built correctly through the HTTP calls
        const testOrgId = 'test-org-123';
        const expectedUrl = 'https://rd-professional-api.example.com/refdata/internal/v1/organisations/test-org-123/pbas';

        const mockRequest = createMockEnhancedRequest();
        const mockResponse = createMockResponse();
        mockRequest.body = { orgId: testOrgId, paymentAccounts: ['PBA123'] };
        mockRequest.http.put.resolves();

        return indexModule.handleUpdatePBARoute(mockRequest, mockResponse).then(() => {
          expect(mockRequest.http.put).to.have.been.calledWith(expectedUrl, sinon.match.any);
        });
      });

      it('should test putStatusUrl function with different org IDs', () => {
        const testOrgId = 'status-org-456';
        const expectedUrl = 'https://rd-professional-api.example.com/refdata/internal/v1/organisations/status-org-456/pba/status';

        const mockRequest = createMockEnhancedRequest();
        const mockResponse = createMockResponse();
        mockRequest.body = { orgId: testOrgId, pbaNumbers: [] };
        mockRequest.http.put.resolves();

        return indexModule.handleSetStatusPBARoute(mockRequest, mockResponse).then(() => {
          expect(mockRequest.http.put).to.have.been.calledWith(expectedUrl, sinon.match.any);
        });
      });

      it('should test getByStatusUrl function with various status values', () => {
        const testCases = [
          { status: 'PENDING', expectedUrl: 'https://rd-professional-api.example.com/refdata/internal/v1/organisations/pba/PENDING' },
          { status: 'ACCEPTED', expectedUrl: 'https://rd-professional-api.example.com/refdata/internal/v1/organisations/pba/ACCEPTED' },
          { status: 'REJECTED', expectedUrl: 'https://rd-professional-api.example.com/refdata/internal/v1/organisations/pba/REJECTED' }
        ];

        const promises = testCases.map((testCase) => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: testCase.status };
          mockRequest.http.get.resolves({ status: 200, data: [] });

          return indexModule.handleGetPBAsByStatusRoute(mockRequest, mockResponse).then(() => {
            expect(mockRequest.http.get).to.have.been.calledWith(testCase.expectedUrl);
          });
        });

        return Promise.all(promises);
      });

      it('should handle URL building with special characters in org ID', () => {
        const specialOrgId = 'org-with-special-chars_123@test';
        const expectedUrl = 'https://rd-professional-api.example.com/refdata/internal/v1/organisations/org-with-special-chars_123@test/pbas';

        const mockRequest = createMockEnhancedRequest();
        const mockResponse = createMockResponse();
        mockRequest.body = { orgId: specialOrgId, paymentAccounts: [] };
        mockRequest.http.put.resolves();

        return indexModule.handleUpdatePBARoute(mockRequest, mockResponse).then(() => {
          expect(mockRequest.http.put).to.have.been.calledWith(expectedUrl, sinon.match.any);
        });
      });

      it('should handle URL building with empty org ID', () => {
        const emptyOrgId = '';
        const expectedUrl = 'https://rd-professional-api.example.com/refdata/internal/v1/organisations//pbas';

        const mockRequest = createMockEnhancedRequest();
        const mockResponse = createMockResponse();
        mockRequest.body = { orgId: emptyOrgId, paymentAccounts: [] };
        mockRequest.http.put.resolves();

        return indexModule.handleUpdatePBARoute(mockRequest, mockResponse).then(() => {
          expect(mockRequest.http.put).to.have.been.calledWith(expectedUrl, sinon.match.any);
        });
      });

      it('should handle URL building with undefined status', () => {
        const mockRequest = createMockEnhancedRequest();
        const mockResponse = createMockResponse();
        mockRequest.params = { status: undefined };
        mockRequest.http.get.resolves({ status: 200, data: [] });

        return indexModule.handleGetPBAsByStatusRoute(mockRequest, mockResponse).then(() => {
          expect(mockRequest.http.get).to.have.been.calledWith(
            'https://rd-professional-api.example.com/refdata/internal/v1/organisations/pba/undefined'
          );
        });
      });

      describe('filterOrganisations function comprehensive tests', () => {
        it('should return empty array when orgs is null', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'test'
            }
          };
          mockRequest.http.get.resolves({ status: 200, data: null });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg).to.deep.equal({ organisations: [], total_records: 0 });
        });

        it('should return empty array when orgs is undefined', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'test'
            }
          };
          mockRequest.http.get.resolves({ status: 200, data: undefined });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg).to.deep.equal({ organisations: [], total_records: 0 });
        });

        it('should handle all text field matching scenarios', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'law'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Law Firm Ltd',
              superUser: { email: 'admin@lawfirm.com' }
            },
            {
              organisationName: 'Tech Corp',
              superUser: { email: 'admin@law-tech.com' }
            },
            {
              organisationName: 'Medical Practice',
              superUser: { email: 'admin@medical.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(2); // Should match 'Law Firm Ltd' and email with 'law-tech'
        });

        it('should handle case where textFieldMatches finds match but drilldownFilterRelevent exists', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'law',
              drill_down_search: [
                { field_name: 'pbaPendings', search_filter: 'PBA123' }
              ]
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Law Firm Ltd',
              superUser: { email: 'admin@lawfirm.com' },
              pbaNumbers: [{ pbaNumber: 'PBA456789' }] // Doesn't match drill-down filter
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(0); // Should not match due to drill-down filter not matching
        });

        it('should handle organisation without superUser but with matching PBA', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'pba123'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Org Without SuperUser',
              pbaNumbers: [{ pbaNumber: 'PBA123456' }]
            // No superUser property
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1);
        });

        it('should handle superUser with only firstName but no lastName', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'john'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Test Org',
              superUser: {
                firstName: 'John',
                // lastName is missing
                email: 'john@example.com'
              }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should match firstName
        });

        it('should handle superUser with only lastName but no firstName', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'doe'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Test Org',
              superUser: {
              // firstName is missing
                lastName: 'Doe',
                email: 'doe@example.com'
              }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should match lastName
        });

        it('should handle organisation without status property', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'test'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Test Org Without Status',
              superUser: { email: 'test@example.com' }
            // No status property
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should match organisation name
        });

        it('should handle exact status matching (case insensitive)', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'active'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Active Org',
              status: 'ACTIVE',
              superUser: { email: 'admin@active.com' }
            },
            {
              organisationName: 'Inactive Org',
              status: 'INACTIVE',
              superUser: { email: 'admin@inactive.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should only match exact status
        });

        it('should handle mixed drill-down filters with different field names', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: '',
              drill_down_search: [
                { field_name: 'pbaPendings', search_filter: 'PBA123' },
                { field_name: 'otherField', search_filter: 'other' } // Non-pbaPendings field
              ]
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Test Org',
              pbaNumbers: [{ pbaNumber: 'PBA123456' }],
              superUser: { email: 'test@example.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should match PBA filter
        });

        it('should handle drill-down filter matching without search_filter', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: '',
              drill_down_search: [
                { field_name: 'pbaPendings', search_filter: 'legal' }
              ]
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Legal Services',
              pbaNumbers: [{ pbaNumber: 'PBA789012' }],
              superUser: { email: 'admin@legal.com' }
            },
            {
              organisationName: 'Tech Corp',
              pbaNumbers: [{ pbaNumber: 'PBA123456' }],
              superUser: { email: 'admin@tech.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should match through multipleFilter
        });

        it('should handle organisation without pbaNumbers and with drill-down filter', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: '',
              drill_down_search: [
                { field_name: 'pbaPendings', search_filter: 'legal' }
              ]
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Legal Services Without PBAs',
              // No pbaNumbers property
              superUser: { email: 'admin@legal.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should match through multipleFilter
        });
      });

      describe('createPaginatedResponse function tests', () => {
        it('should handle first page pagination', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 2 },
              search_filter: ''
            }
          };
          const apiResponseData = [
            { organisationName: 'Org 1' },
            { organisationName: 'Org 2' },
            { organisationName: 'Org 3' },
            { organisationName: 'Org 4' }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(2);
          expect(responseArg.organisations[0].organisationName).to.equal('Org 1');
          expect(responseArg.organisations[1].organisationName).to.equal('Org 2');
          expect(responseArg.total_records).to.equal(4);
        });

        it('should handle last page with fewer items than page_size', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 3, page_size: 2 },
              search_filter: ''
            }
          };
          const apiResponseData = [
            { organisationName: 'Org 1' },
            { organisationName: 'Org 2' },
            { organisationName: 'Org 3' },
            { organisationName: 'Org 4' },
            { organisationName: 'Org 5' } // Only 1 item on last page
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1);
          expect(responseArg.organisations[0].organisationName).to.equal('Org 5');
          expect(responseArg.total_records).to.equal(5);
        });

        it('should handle empty page beyond available data', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 5, page_size: 10 },
              search_filter: ''
            }
          };
          const apiResponseData = [
            { organisationName: 'Org 1' },
            { organisationName: 'Org 2' }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(0);
          expect(responseArg.total_records).to.equal(2);
        });

        it('should handle single item pagination', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 1 },
              search_filter: ''
            }
          };
          const apiResponseData = [
            { organisationName: 'Single Org' }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1);
          expect(responseArg.organisations[0].organisationName).to.equal('Single Org');
          expect(responseArg.total_records).to.equal(1);
        });

        it('should handle zero page_size', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 0 },
              search_filter: ''
            }
          };
          const apiResponseData = [
            { organisationName: 'Org 1' },
            { organisationName: 'Org 2' }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(0);
          expect(responseArg.total_records).to.equal(2);
        });

        it('should handle large page_size exceeding data length', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 100 },
              search_filter: ''
            }
          };
          const apiResponseData = [
            { organisationName: 'Org 1' },
            { organisationName: 'Org 2' }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(2);
          expect(responseArg.total_records).to.equal(2);
        });
      });

      describe('textFieldMatches function comprehensive tests', () => {
        it('should handle single-level field matching', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'test'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Test Organisation',
              superUser: { email: 'admin@test.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should match organisationName field
        });

        it('should handle nested field matching (superUser.email)', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'nested'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Organisation',
              superUser: { email: 'nested@example.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should match nested email field
        });

        it('should handle missing nested field gracefully', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'missing'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Organisation without SuperUser'
            // No superUser property, so superUser.email will be undefined
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(0); // Should not match due to missing field
        });

        it('should handle null field values', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'null'
            }
          };
          const apiResponseData = [
            {
              organisationName: null, // Null value
              superUser: { email: 'test@example.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(0); // Should not match null value
        });

        it('should handle empty string field values', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: ''
            }
          };
          const apiResponseData = [
            {
              organisationName: '', // Empty string
              superUser: { email: 'test@example.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Empty filter should return all
        });

        it('should handle case sensitivity properly', async () => {
          const mockRequest = createMockEnhancedRequest();
          const mockResponse = createMockResponse();
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'UPPER'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'upper case org', // lowercase but should match
              superUser: { email: 'admin@upper.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          expect(mockResponse.send).to.have.been.called;
          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.exist;
          expect(responseArg.organisations).to.have.length(1); // Should match case-insensitively
        });

        describe('multipleFilter function comprehensive tests', () => {
          it('should match organisation name through multipleFilter', async () => {
            const mockRequest = createMockEnhancedRequest();
            const mockResponse = createMockResponse();
            mockRequest.params = { status: 'PENDING' };
            mockRequest.body = {
              searchRequest: {
                pagination_parameters: { page_number: 1, page_size: 10 },
                search_filter: '',
                drill_down_search: [
                  { field_name: 'pbaPendings', search_filter: 'Legal' }
                ]
              }
            };
            const apiResponseData = [
              {
                organisationName: 'Legal Services Ltd',
                superUser: { email: 'admin@legal.com' }
                // No pbaNumbers to trigger multipleFilter path
              }
            ];
            mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

            await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

            expect(mockResponse.send).to.have.been.called;
            const responseArg = mockResponse.send.getCall(0).args[0];
            expect(responseArg).to.exist;
            expect(responseArg.organisations).to.have.length(1); // Should match through multipleFilter
          });

          it('should match superUser.email through multipleFilter', async () => {
            const mockRequest = createMockEnhancedRequest();
            const mockResponse = createMockResponse();
            mockRequest.params = { status: 'PENDING' };
            mockRequest.body = {
              searchRequest: {
                pagination_parameters: { page_number: 1, page_size: 10 },
                search_filter: '',
                drill_down_search: [
                  { field_name: 'pbaPendings', search_filter: 'legal' }
                ]
              }
            };
            const apiResponseData = [
              {
                organisationName: 'Some Organisation',
                superUser: { email: 'admin@legal.com' }
                // No pbaNumbers to trigger multipleFilter path
              }
            ];
            mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

            await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

            expect(mockResponse.send).to.have.been.called;
            const responseArg = mockResponse.send.getCall(0).args[0];
            expect(responseArg).to.exist;
            expect(responseArg.organisations).to.have.length(1); // Should match email through multipleFilter
          });

          it('should handle multiple drill-down filters in multipleFilter', async () => {
            const mockRequest = createMockEnhancedRequest();
            const mockResponse = createMockResponse();
            mockRequest.params = { status: 'PENDING' };
            mockRequest.body = {
              searchRequest: {
                pagination_parameters: { page_number: 1, page_size: 10 },
                search_filter: '',
                drill_down_search: [
                  { field_name: 'pbaPendings', search_filter: 'legal' },
                  { field_name: 'pbaPendings', search_filter: 'services' }
                ]
              }
            };
            const apiResponseData = [
              {
                organisationName: 'Legal Services Ltd',
                superUser: { email: 'admin@company.com' }
                // No pbaNumbers to trigger multipleFilter path
              }
            ];
            mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

            await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

            expect(mockResponse.send).to.have.been.called;
            const responseArg = mockResponse.send.getCall(0).args[0];
            expect(responseArg).to.exist;
            expect(responseArg.organisations).to.have.length(1); // Should match both filters
          });

          it('should handle no matches in multipleFilter', async () => {
            const mockRequest = createMockEnhancedRequest();
            const mockResponse = createMockResponse();
            mockRequest.params = { status: 'PENDING' };
            mockRequest.body = {
              searchRequest: {
                pagination_parameters: { page_number: 1, page_size: 10 },
                search_filter: '',
                drill_down_search: [
                  { field_name: 'pbaPendings', search_filter: 'nonexistent' }
                ]
              }
            };
            const apiResponseData = [
              {
                organisationName: 'Legal Services Ltd',
                superUser: { email: 'admin@company.com' }
                // No pbaNumbers to trigger multipleFilter path
              }
            ];
            mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

            await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

            expect(mockResponse.send).to.have.been.called;
            const responseArg = mockResponse.send.getCall(0).args[0];
            expect(responseArg).to.exist;
            expect(responseArg.organisations).to.have.length(0); // Should not match
          });

          it('should handle drill-down filter with organisation without fields', async () => {
            const mockRequest = createMockEnhancedRequest();
            const mockResponse = createMockResponse();
            mockRequest.params = { status: 'PENDING' };
            mockRequest.body = {
              searchRequest: {
                pagination_parameters: { page_number: 1, page_size: 10 },
                search_filter: '',
                drill_down_search: [
                  { field_name: 'pbaPendings', search_filter: 'test' }
                ]
              }
            };
            const apiResponseData = [
              {
                // Missing both organisationName and superUser
              }
            ];
            mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

            await indexModule.handlePostPBAsByStatusRoute(mockRequest, mockResponse);

            expect(mockResponse.send).to.have.been.called;
            const responseArg = mockResponse.send.getCall(0).args[0];
            expect(responseArg).to.exist;
            expect(responseArg.organisations).to.have.length(0); // Should not match
          });
        });
      });

      describe('Edge cases in filtering', () => {
        let handlePostPBAsByStatusRoute: any;

        beforeEach(() => {
          delete require.cache[require.resolve('./index')];
          const module = require('./index');
          handlePostPBAsByStatusRoute = module.handlePostPBAsByStatusRoute;
        });

        it('should handle null organisation in array', async () => {
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'test'
            }
          };
          const apiResponseData = [
            null, // Null organisation
            { organisationName: 'Test Org', superUser: { email: 'test@example.com' } }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg.organisations).to.have.length(1); // Should filter out null and match "Test Org"
        });

        it('should handle empty drill down search array', async () => {
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: '',
              drill_down_search: [] // Empty array
            }
          };
          const apiResponseData = [
            { organisationName: 'Test Org', superUser: { email: 'test@example.com' } }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg.organisations).to.have.length(1);
        });

        it('should handle superUser without firstName or lastName', async () => {
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'incomplete'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Test Org',
              superUser: { email: 'incomplete@example.com' } // Missing firstName and lastName
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg).to.have.property('organisations');
          expect(responseArg).to.have.property('total_records');
        });

        it('should handle pagination at the exact boundary', async () => {
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 2, page_size: 2 },
              search_filter: ''
            }
          };
          const apiResponseData = [
            { organisationName: 'Org 1' },
            { organisationName: 'Org 2' },
            { organisationName: 'Org 3' },
            { organisationName: 'Org 4' } // Exactly fills pagination
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg.organisations).to.have.length(2); // Page 2, items 3 and 4
          expect(responseArg.organisations[0].organisationName).to.equal('Org 3');
          expect(responseArg.organisations[1].organisationName).to.equal('Org 4');
          expect(responseArg.total_records).to.equal(4);
        });

        it('should handle mixed case PBA number filtering', async () => {
          mockRequest.params = { status: 'PENDING' };
          mockRequest.body = {
            searchRequest: {
              pagination_parameters: { page_number: 1, page_size: 10 },
              search_filter: 'pba'
            }
          };
          const apiResponseData = [
            {
              organisationName: 'Org 1',
              pbaNumbers: [{ pbaNumber: 'pba123456' }], // lowercase
              superUser: { email: 'admin@org1.com' }
            },
            {
              organisationName: 'Org 2',
              pbaNumbers: [{ pbaNumber: 'PBA789012' }], // uppercase
              superUser: { email: 'admin@org2.com' }
            }
          ];
          mockRequest.http.get.resolves({ status: 200, data: apiResponseData });

          await handlePostPBAsByStatusRoute(mockRequest, mockResponse);

          const responseArg = mockResponse.send.getCall(0).args[0];
          expect(responseArg.organisations).to.have.length(2); // Should match both case variations
        });
      });
    });
  });
});
