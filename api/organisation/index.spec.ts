import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createAuthMocks } from '../test/shared/authMocks';
import { Router } from 'express';

describe('organisation/index', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;
  let loggerMock: any;
  let configMock: any;

  beforeEach(() => {
    delete require.cache[require.resolve('./index')];
    delete require.cache[require.resolve('../configuration')];
    delete require.cache[require.resolve('../lib/log4jui')];

    const authMocks = createAuthMocks();
    mockReq = authMocks.req;
    mockRes = authMocks.res;
    mockNext = sinon.stub();

    loggerMock = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub()
    };

    configMock = {
      getConfigValue: sinon.stub().returns('https://rd-professional-api.example.com')
    };

    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(loggerMock);
    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configMock.getConfigValue);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('router setup', () => {
    it('should export a router with correct routes', () => {
      const router = require('./index').default;
      expect(router).to.exist;
      expect(router.stack).to.exist;
      expect(router.stack.length).to.be.greaterThan(0);
    });

    it('should have GET route for organisations', () => {
      const router = require('./index').default;
      const getRoute = router.stack.find((layer) => layer.route && layer.route.path === '/' && layer.route.methods.get);
      expect(getRoute).to.exist;
    });

    it('should have POST route for organisation paging', () => {
      const router = require('./index').default;
      const postRoute = router.stack.find((layer) => layer.route && layer.route.path === '/' && layer.route.methods.post);
      expect(postRoute).to.exist;
    });

    it('should have PUT route for organisation update', () => {
      const router = require('./index').default;
      const putRoute = router.stack.find((layer) => layer.route && layer.route.path === '/:id' && layer.route.methods.put);
      expect(putRoute).to.exist;
    });

    it('should have DELETE route for organisation deletion', () => {
      const router = require('./index').default;
      const deleteRoute = router.stack.find((layer) => layer.route && layer.route.path === '/:id' && layer.route.methods.delete);
      expect(deleteRoute).to.exist;
    });

    it('should have GET route for deletable status', () => {
      const router = require('./index').default;
      const getDeletableRoute = router.stack.find((layer) => layer.route && layer.route.path === '/:id/isDeletable' && layer.route.methods.get);
      expect(getDeletableRoute).to.exist;
    });
  });

  describe('GET organisations route', () => {
    it('should handle individual organisation request', async () => {
      mockReq.query = { organisationId: '12345' };
      mockReq.params = {};
      const orgData = { name: 'Test Organisation', sraId: '123' };

      mockReq.http.get.resolves({ data: orgData });

      const router = require('./index').default;
      const getHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      await getHandler(mockReq, mockRes, mockNext);

      expect(mockReq.http.get).to.have.been.called;
      expect(mockRes.send).to.have.been.calledWith(orgData);
    });

    it('should handle multiple organisations response', async () => {
      mockReq.query = { status: 'ACTIVE' };
      mockReq.params = {};
      const orgList = [
        { name: 'Org 1', sraId: '123' },
        { name: 'Org 2', sraId: '456' }
      ];

      mockReq.http.get.resolves({
        data: { organisations: orgList }
      });

      const router = require('./index').default;
      const getHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      await getHandler(mockReq, mockRes, mockNext);

      expect(mockRes.send).to.have.been.calledWith(orgList);
    });

    it('should handle API errors gracefully', async () => {
      mockReq.query = { organisationId: '12345' };
      mockReq.params = {};
      const error = new Error('API Error') as any;
      error.status = 500;
      error.data = { message: 'Internal server error' };

      mockReq.http.get.rejects(error);

      const router = require('./index').default;
      const getHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      await getHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).to.have.been.calledWith(500);
    });

    it('should handle search_filter query parameter', async () => {
      mockReq.query = { search_filter: 'test' };
      mockReq.body = {
        searchRequest: {
          search_filter: 'test',
          pagination_parameters: {
            page_number: 1,
            page_size: 10
          }
        }
      };

      const orgList = [{ name: 'Test Org', sraId: '123' }];
      mockReq.http.get.resolves({
        data: { organisations: orgList },
        headers: { total_records: '1' }
      });

      const router = require('./index').default;
      const getHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      await getHandler(mockReq, mockRes, mockNext);

      expect(mockRes.send).to.have.been.called;
    });

    it('should handle version parameter', async () => {
      mockReq.query = { version: 'v2', status: 'ACTIVE' };
      mockReq.params = {};
      const orgData = { name: 'Test Organisation', sraId: '123' };

      mockReq.http.get.resolves({ data: orgData });

      const router = require('./index').default;
      const getHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      await getHandler(mockReq, mockRes, mockNext);

      expect(mockReq.http.get).to.have.been.calledWith(sinon.match(/v2/));
      expect(mockRes.send).to.have.been.calledWith(orgData);
    });

    it('should handle usersOrgId parameter', async () => {
      mockReq.query = { usersOrgId: '12345', page: '1' };
      mockReq.params = {};
      const userData = { users: [{ name: 'Test User' }] };

      mockReq.http.get.resolves({ data: userData });

      const router = require('./index').default;
      const getHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      await getHandler(mockReq, mockRes, mockNext);

      expect(mockReq.http.get).to.have.been.calledWith(sinon.match(/12345\/users/));
      expect(mockRes.send).to.have.been.calledWith(userData);
    });

    it('should handle console.log for organisationUrl', async () => {
      const consoleSpy = sinon.spy(console, 'log');
      mockReq.query = { status: 'ACTIVE' };
      mockReq.params = {};
      const orgData = { name: 'Test Organisation' };

      mockReq.http.get.resolves({ data: orgData });

      const router = require('./index').default;
      const getHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      await getHandler(mockReq, mockRes, mockNext);

      expect(consoleSpy).to.have.been.called;
      consoleSpy.restore();
    });

    it('should handle console.log for error message', async () => {
      const consoleSpy = sinon.spy(console, 'log');
      mockReq.query = { organisationId: '12345' };
      mockReq.params = {};
      const error = new Error('Test Error') as any;
      error.status = 500;
      error.data = { message: 'Test error message' };

      mockReq.http.get.rejects(error);

      const router = require('./index').default;
      const getHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.get
      ).route.stack[0].handle;

      await getHandler(mockReq, mockRes, mockNext);

      expect(consoleSpy).to.have.been.called;
      consoleSpy.restore();
    });
  });

  describe('POST organisations route (paging)', () => {
    beforeEach(() => {
      mockReq.body = {
        searchRequest: {
          search_filter: '',
          pagination_parameters: {
            page_number: 1,
            page_size: 10
          }
        }
      };
      mockReq.query = { status: 'PENDING' };
      mockReq.params = {};
    });

    it('should handle pagination without search filter', async () => {
      const orgList = [
        { name: 'Org 1', status: 'PENDING' },
        { name: 'Org 2', status: 'PENDING' }
      ];

      mockReq.http.get.resolves({
        data: { organisations: orgList },
        headers: { total_records: '20' }
      });

      const router = require('./index').default;
      const postHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.post
      ).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      expect(mockRes.send).to.have.been.calledWith({
        organisations: orgList,
        total_records: '20'
      });
    });

    it('should handle empty organisations response', async () => {
      mockReq.http.get.resolves({
        data: { organisations: null },
        headers: { total_records: '0' }
      });

      const router = require('./index').default;
      const postHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.post
      ).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      expect(mockRes.send).to.have.been.calledWith({
        organisations: [],
        total_records: 0
      });
    });

    it('should handle API errors in paging', async () => {
      const error = new Error('Paging API Error') as any;
      error.status = 400;
      error.data = { message: 'Bad request' };
      mockReq.http.get.rejects(error);

      const router = require('./index').default;
      const postHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.post
      ).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(500);
    });

    it('should handle search filter with ACTIVE status', async () => {
      mockReq.body = {
        searchRequest: {
          search_filter: 'test',
          pagination_parameters: {
            page_number: 1,
            page_size: 10
          }
        }
      };
      mockReq.query = { status: 'ACTIVE' };

      const orgList = [{ name: 'Test Org', status: 'ACTIVE' }];
      mockReq.http.get.resolves({
        data: { organisations: orgList },
        headers: { total_records: '500' }
      });

      const router = require('./index').default;
      const postHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.post
      ).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      expect(mockRes.send).to.have.been.called;
    });

    it('should handle search filter with non-ACTIVE status', async () => {
      mockReq.body = {
        searchRequest: {
          search_filter: 'test',
          pagination_parameters: {
            page_number: 1,
            page_size: 10
          }
        }
      };
      mockReq.query = { status: 'PENDING' };

      const orgList = [{ name: 'Test Org', status: 'PENDING' }];
      mockReq.http.get.resolves({
        data: { organisations: orgList }
      });

      const router = require('./index').default;
      const postHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.post
      ).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      expect(mockRes.send).to.have.been.called;
    });

    it('should handle search filter with null organisations data', async () => {
      mockReq.body = {
        searchRequest: {
          search_filter: 'test',
          pagination_parameters: {
            page_number: 1,
            page_size: 10
          }
        }
      };
      mockReq.query = { status: 'PENDING' };

      mockReq.http.get.resolves(null);

      const router = require('./index').default;
      const postHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.post
      ).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      expect(mockRes.send).to.have.been.calledWith({
        organisations: [],
        total_records: 0
      });
    });

    it('should handle search filter with response data but no organisations', async () => {
      mockReq.body = {
        searchRequest: {
          search_filter: 'test',
          pagination_parameters: {
            page_number: 1,
            page_size: 10
          }
        }
      };
      mockReq.query = { status: 'PENDING' };

      // Mock the call to return a list of organizations for filtering
      const orgList = [{ name: 'Test Org', status: 'PENDING' }];
      mockReq.http.get.resolves({ data: { organisations: orgList } });

      const router = require('./index').default;
      const postHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/' && layer.route.methods.post
      ).route.stack[0].handle;

      await postHandler(mockReq, mockRes);

      expect(mockRes.send).to.have.been.called;
    });
  });

  describe('DELETE organisation route', () => {
    it('should handle organisation deletion successfully', async () => {
      mockReq.params = { id: '12345' };
      mockReq.http.delete = sinon.stub().resolves({ status: 204 });

      const router = require('./index').default;
      const deleteHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id' && layer.route.methods.delete
      ).route.stack[0].handle;

      await deleteHandler(mockReq, mockRes);

      expect(mockReq.http.delete).to.have.been.called;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(mockRes.send).to.have.been.calledWith({ value: 'Resource deleted successfully' });
    });

    it('should handle deletion errors', async () => {
      mockReq.params = { id: '12345' };
      const error = new Error('Deletion failed') as any;
      error.status = 409;
      error.data = { message: 'Conflict' };
      mockReq.http.delete = sinon.stub().rejects(error);

      const router = require('./index').default;
      const deleteHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id' && layer.route.methods.delete
      ).route.stack[0].handle;

      await deleteHandler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(409);
    });

    it('should handle missing organisation id', async () => {
      mockReq.params = {};

      const router = require('./index').default;
      const deleteHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id' && layer.route.methods.delete
      ).route.stack[0].handle;

      await deleteHandler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(400);
      expect(mockRes.send).to.have.been.calledWith('Organisation id is missing');
    });
  });

  describe('PUT organisation status route', () => {
    it('should update organisation status', async () => {
      mockReq.params = { id: '12345' };
      mockReq.body = { status: 'ACTIVE' };
      mockReq.http.put = sinon.stub().resolves({
        status: 200,
        data: { organisationIdentifier: '12345', status: 'ACTIVE' }
      });

      const router = require('./index').default;
      const putHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id' && layer.route.methods.put
      ).route.stack[0].handle;

      await putHandler(mockReq, mockRes);

      expect(mockReq.http.put).to.have.been.called;
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(mockRes.send).to.have.been.called;
    });

    it('should handle status update errors', async () => {
      mockReq.params = { id: '12345' };
      mockReq.body = { status: 'ACTIVE' };
      const error = new Error('Update failed') as any;
      error.status = 400;
      error.data = { message: 'Bad request' };
      mockReq.http.put = sinon.stub().rejects(error);

      const router = require('./index').default;
      const putHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id' && layer.route.methods.put
      ).route.stack[0].handle;

      await putHandler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(500);
    });

    it('should handle missing organisation id', async () => {
      mockReq.params = {};
      mockReq.body = { status: 'ACTIVE' };

      const router = require('./index').default;
      const putHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id' && layer.route.methods.put
      ).route.stack[0].handle;

      await putHandler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(400);
      expect(mockRes.send).to.have.been.calledWith('Organisation id is missing');
    });

    it('should handle console.error in PUT route', async () => {
      const consoleSpy = sinon.spy(console, 'error');
      mockReq.params = { id: '12345' };
      mockReq.body = { status: 'ACTIVE' };
      const error = new Error('Update failed') as any;
      error.status = 400;
      error.data = { message: 'Bad request' };
      mockReq.http.put = sinon.stub().rejects(error);

      const router = require('./index').default;
      const putHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id' && layer.route.methods.put
      ).route.stack[0].handle;

      await putHandler(mockReq, mockRes);

      expect(consoleSpy).to.have.been.calledWith(error);
      consoleSpy.restore();
    });
  });

  describe('GET deletable status route', () => {
    it('should check if organisation is deletable', async () => {
      mockReq.params = { id: '12345' };
      mockReq.http.get.resolves({
        data: {
          users: [{ idamStatus: 'PENDING' }]
        }
      });

      const router = require('./index').default;
      const getDeletableHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id/isDeletable' && layer.route.methods.get
      ).route.stack[0].handle;

      await getDeletableHandler(mockReq, mockRes);

      expect(mockRes.send).to.have.been.calledWith({
        organisationDeletable: true
      });
    });

    it('should return false for non-deletable organisation', async () => {
      mockReq.params = { id: '12345' };
      mockReq.http.get.resolves({
        data: {
          users: [
            { idamStatus: 'ACTIVE' },
            { idamStatus: 'PENDING' }
          ]
        }
      });

      const router = require('./index').default;
      const getDeletableHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id/isDeletable' && layer.route.methods.get
      ).route.stack[0].handle;

      await getDeletableHandler(mockReq, mockRes);

      expect(mockRes.send).to.have.been.calledWith({
        organisationDeletable: false
      });
    });

    it('should handle missing organisation id', async () => {
      mockReq.params = {};

      const router = require('./index').default;
      const getDeletableHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id/isDeletable' && layer.route.methods.get
      ).route.stack[0].handle;

      await getDeletableHandler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(400);
      expect(mockRes.send).to.have.been.calledWith('Organisation id is missing');
    });

    it('should handle API errors', async () => {
      mockReq.params = { id: '12345' };
      const error = new Error('API Error') as any;
      error.status = 500;
      error.data = { message: 'Internal server error' };
      mockReq.http.get.rejects(error);

      const router = require('./index').default;
      const getDeletableHandler = router.stack.find((layer: any) =>
        layer.route && layer.route.path === '/:id/isDeletable' && layer.route.methods.get
      ).route.stack[0].handle;

      await getDeletableHandler(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(500);
    });
  });

  describe('Utility functions', () => {
    let filterOrganisations: any;
    let postCodeMatches: any;
    let createPaginatedResponse: any;
    let textFieldMatches: any;
    let getActiveOrganisations: any;

    beforeEach(() => {
      const orgIndex = require('./index');
      filterOrganisations = orgIndex.filterOrganisations;
      postCodeMatches = orgIndex.postCodeMatches;
      createPaginatedResponse = orgIndex.createPaginatedResponse;
      textFieldMatches = orgIndex.textFieldMatches;
      getActiveOrganisations = orgIndex.getActiveOrganisations;
    });

    describe('filterOrganisations', () => {
      it('should return empty array for null orgs', () => {
        const result = filterOrganisations(null, 'test');
        expect(result).to.deep.equal([]);
      });

      it('should return all orgs for empty search filter', () => {
        const orgs = [{ name: 'Test Org', contactInformation: [] }];
        const result = filterOrganisations(orgs, '');
        expect(result).to.deep.equal(orgs);
      });

      it('should filter by name', () => {
        const orgs = [
          { name: 'Test Organisation', contactInformation: [] },
          { name: 'Other Firm', contactInformation: [] }
        ];
        const result = filterOrganisations(orgs, 'test');
        expect(result).to.have.length(1);
        expect(result[0].name).to.equal('Test Organisation');
      });

      it('should filter by sraId', () => {
        const orgs = [
          { name: 'Org 1', sraId: '12345', contactInformation: [] },
          { name: 'Org 2', sraId: '67890', contactInformation: [] }
        ];
        const result = filterOrganisations(orgs, '123');
        expect(result).to.have.length(1);
        expect(result[0].sraId).to.equal('12345');
      });

      it('should filter by admin field', () => {
        const orgs = [
          { name: 'Org 1', admin: 'john@example.com', contactInformation: [] },
          { name: 'Org 2', admin: 'jane@example.com', contactInformation: [] }
        ];
        const result = filterOrganisations(orgs, 'john');
        expect(result).to.have.length(1);
        expect(result[0].admin).to.equal('john@example.com');
      });

      it('should filter by pbaNumber', () => {
        const orgs = [
          { name: 'Org 1', pbaNumber: ['PBA1234567'], contactInformation: [] },
          { name: 'Org 2', pbaNumber: ['PBA9876543'], contactInformation: [] }
        ];
        const result = filterOrganisations(orgs, '1234');
        expect(result).to.have.length(1);
        expect(result[0].pbaNumber[0]).to.equal('PBA1234567');
      });

      it('should filter by dxNumber', () => {
        const orgs = [
          {
            name: 'Org 1',
            dxNumber: [{ dxNumber: 'DX123456', dxExchange: 'London' }],
            contactInformation: []
          },
          {
            name: 'Org 2',
            dxNumber: [{ dxNumber: 'DX789012', dxExchange: 'Manchester' }],
            contactInformation: []
          }
        ];
        const result = filterOrganisations(orgs, '123');
        expect(result).to.have.length(1);
        expect(result[0].dxNumber[0].dxNumber).to.equal('DX123456');
      });

      it('should filter by dxExchange', () => {
        const orgs = [
          {
            name: 'Org 1',
            dxNumber: [{ dxNumber: 'DX123456', dxExchange: 'London' }],
            contactInformation: []
          },
          {
            name: 'Org 2',
            dxNumber: [{ dxNumber: 'DX789012', dxExchange: 'Manchester' }],
            contactInformation: []
          }
        ];
        const result = filterOrganisations(orgs, 'london');
        expect(result).to.have.length(1);
        expect(result[0].dxNumber[0].dxExchange).to.equal('London');
      });

      it('should handle postCode filtering', () => {
        const orgs = [
          {
            name: 'Org 1',
            contactInformation: [{ postCode: 'SW1A 1AA' }]
          },
          {
            name: 'Org 2',
            contactInformation: [{ postCode: 'M1 1AA' }]
          }
        ];
        const result = filterOrganisations(orgs, 'sw1a');
        expect(result).to.have.length(1);
        expect(result[0].contactInformation[0].postCode).to.equal('SW1A 1AA');
      });

      it('should return false for null org', () => {
        const orgs = [null, { name: 'Valid Org', contactInformation: [] }];
        const result = filterOrganisations(orgs, 'valid');
        expect(result).to.have.length(1);
        expect(result[0].name).to.equal('Valid Org');
      });

      it('should handle empty dxNumber array', () => {
        const orgs = [{ name: 'Org 1', dxNumber: [], contactInformation: [] }];
        const result = filterOrganisations(orgs, 'dx123');
        expect(result).to.have.length(0);
      });

      it('should handle dxNumber with null values', () => {
        const orgs = [{ name: 'Org 1', dxNumber: [null], contactInformation: [] }];
        const result = filterOrganisations(orgs, 'dx123');
        expect(result).to.have.length(0);
      });

      it('should handle dxNumber without dxNumber field', () => {
        const orgs = [{
          name: 'Org 1',
          dxNumber: [{ dxExchange: 'London' }],
          contactInformation: []
        }];
        const result = filterOrganisations(orgs, '123');
        expect(result).to.have.length(0);
      });

      it('should handle dxNumber without dxExchange field', () => {
        const orgs = [{
          name: 'Org 1',
          dxNumber: [{ dxNumber: 'DX123456' }],
          contactInformation: []
        }];
        const result = filterOrganisations(orgs, 'london');
        expect(result).to.have.length(0);
      });

      it('should handle empty pbaNumber array', () => {
        const orgs = [{ name: 'Org 1', pbaNumber: [], contactInformation: [] }];
        const result = filterOrganisations(orgs, 'pba123');
        expect(result).to.have.length(0);
      });

      it('should handle case insensitive search', () => {
        const orgs = [{ name: 'TEST ORGANISATION', contactInformation: [] }];
        const result = filterOrganisations(orgs, 'test');
        expect(result).to.have.length(1);
      });

      it('should handle undefined search filter', () => {
        const orgs = [{ name: 'Test Org', contactInformation: [] }];
        const result = filterOrganisations(orgs, undefined);
        expect(result).to.deep.equal(orgs);
      });
    });

    describe('postCodeMatches', () => {
      it('should match postcode with spaces removed', () => {
        const org = {
          contactInformation: [{ postCode: 'SW1A 1AA' }]
        };
        const result = postCodeMatches(org, 'sw1a1aa');
        expect(result).to.be.true;
      });

      it('should handle null postCode', () => {
        const org = {
          contactInformation: [{ postCode: null }]
        };
        const result = postCodeMatches(org, 'test');
        expect(result).to.be.false;
      });

      it('should handle empty contactInformation', () => {
        const org = {
          contactInformation: []
        };
        const result = postCodeMatches(org, 'test');
        expect(result).to.be.false;
      });

      it('should match partial postcode', () => {
        const org = {
          contactInformation: [{ postCode: 'SW1A 1AA' }]
        };
        const result = postCodeMatches(org, '1aa');
        expect(result).to.be.true;
      });
    });

    describe('createPaginatedResponse', () => {
      it('should create paginated response correctly', () => {
        const paginationParams = {
          page_number: 2,
          page_size: 2
        };
        const orgs = [
          { name: 'Org 1' },
          { name: 'Org 2' },
          { name: 'Org 3' },
          { name: 'Org 4' }
        ];
        const result = createPaginatedResponse(paginationParams, orgs);
        expect(result.organisations).to.have.length(2);
        expect(result.organisations[0].name).to.equal('Org 3');
        expect(result.total_records).to.equal(4);
      });

      it('should handle end index beyond array length', () => {
        const paginationParams = {
          page_number: 2,
          page_size: 5
        };
        const orgs = [
          { name: 'Org 1' },
          { name: 'Org 2' },
          { name: 'Org 3' }
        ];
        const result = createPaginatedResponse(paginationParams, orgs);
        expect(result.organisations).to.have.length(0);
        expect(result.total_records).to.equal(3);
      });
    });

    describe('textFieldMatches', () => {
      it('should match text field case insensitively', () => {
        const org = { name: 'Test Organisation' };
        const result = textFieldMatches(org, 'name', 'test');
        expect(result).to.be.true;
      });

      it('should return false for null field', () => {
        const org = { name: null };
        const result = textFieldMatches(org, 'name', 'test');
        expect(result).to.not.be.ok;
      });
    });
  });
});
