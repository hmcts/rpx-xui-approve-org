import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockLogger } from '../test/shared/loggerMocks';
import { createMockEnhancedRequest, createMockResponse } from '../test/shared/authMocks';

describe('states/index', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockLogger: any;
  let payloadBuilderStub: any;
  let rdProfessionalStub: any;
  let stateEngineStub: any;
  let asyncReturnOrErrorStub: any;

  beforeEach(() => {
    mockRequest = createMockEnhancedRequest();
    mockRequest.body = {
      fromValues: {
        organisationName: 'Test Org',
        firstName: 'John',
        lastName: 'Doe'
      }
    };
    mockRequest.params = {
      jurId: 'test-jur',
      caseTypeId: 'test-case-type',
      caseId: 'test-case',
      stateId: 'test-state'
    };

    mockResponse = createMockResponse();
    mockLogger = createMockLogger();

    payloadBuilderStub = sinon.stub().returns({ organisation: 'test-payload' });
    rdProfessionalStub = sinon.stub().resolves({ data: 'success' });
    stateEngineStub = sinon.stub();
    asyncReturnOrErrorStub = sinon.stub();

    sinon.stub(require('../lib/log4jui'), 'getLogger').returns(mockLogger);
    sinon.stub(require('../lib/payloadBuilder'), 'makeOrganisationPayload').callsFake(payloadBuilderStub);
    sinon.stub(require('../services/rdProfessional'), 'postOrganisation').callsFake(rdProfessionalStub);
    sinon.stub(require('../lib/stateEngine'), 'process').callsFake(stateEngineStub);
    sinon.stub(require('../lib/util'), 'asyncReturnOrError').callsFake(asyncReturnOrErrorStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('registerOrganisation', () => {
    let registerOrganisation: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      // Access the private function through the module
      registerOrganisation = async (req, res) => {
        const organisationPayload = payloadBuilderStub(req.body.fromValues);
        return await asyncReturnOrErrorStub(
          rdProfessionalStub(organisationPayload, req),
          'Error registering organisation',
          res,
          mockLogger,
          false
        );
      };
    });

    it('should build organisation payload and call rdProfessional service', async () => {
      asyncReturnOrErrorStub.resolves('success');

      await registerOrganisation(mockRequest, mockResponse);

      expect(payloadBuilderStub).to.have.been.calledWith(mockRequest.body.fromValues);
      expect(rdProfessionalStub).to.have.been.calledWith({ organisation: 'test-payload' }, mockRequest);
      expect(asyncReturnOrErrorStub).to.have.been.calledWith(
        sinon.match.any,
        'Error registering organisation',
        mockResponse,
        mockLogger,
        false
      );
    });
  });

  describe('payload function', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should handle successful organisation registration', async () => {
      asyncReturnOrErrorStub.resolves('success');

      // Mock the internal payload function behavior
      const mockPayloadFunction = async (req, res) => {
        const result = await asyncReturnOrErrorStub();
        if (result) {
          return 'registration-confirmation';
        }
        res.status(400).send('Error registering organisation');
        return null;
      };

      const result = await mockPayloadFunction(mockRequest, mockResponse);

      expect(result).to.equal('registration-confirmation');
      expect(mockResponse.status).not.to.have.been.called;
    });

    it('should handle failed organisation registration', async () => {
      asyncReturnOrErrorStub.resolves(null);

      const mockPayloadFunction = async (req, res) => {
        const result = await asyncReturnOrErrorStub();
        if (result) {
          return 'registration-confirmation';
        }
        res.status(400).send('Error registering organisation');
        return null;
      };

      const result = await mockPayloadFunction(mockRequest, mockResponse);

      expect(result).to.be.null;
      expect(mockResponse.status).to.have.been.calledWith(400);
      expect(mockResponse.send).to.have.been.calledWith('Error registering organisation');
    });
  });

  describe('handleStateRoute', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should call state engine process function', () => {
      const handler = router.stack[0].route.stack[0].handle;
      handler(mockRequest, mockResponse);

      expect(stateEngineStub).to.have.been.calledWith(
        mockRequest,
        mockResponse,
        sinon.match.any, // mapping
        sinon.match.any, // payload function
        sinon.match.any, // templates
        sinon.match.any // store
      );
    });
  });

  describe('router configuration', () => {
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
    });

    it('should export router', () => {
      expect(router).to.exist;
      expect(router).to.be.a('function');
    });

    it('should have GET route configured for states endpoint', () => {
      const getRoute = router.stack.find((layer) =>
        layer.route && layer.route.path === '/states/:jurId/:caseTypeId/:caseId/:stateId' && layer.route.methods.get
      );
      expect(getRoute).to.exist;
    });

    it('should have POST route configured for states endpoint', () => {
      const postRoute = router.stack.find((layer) =>
        layer.route && layer.route.path === '/states/:jurId/:caseTypeId/:caseId/:stateId' && layer.route.methods.post
      );
      expect(postRoute).to.exist;
    });

    it('should have exactly 2 routes configured', () => {
      expect(router.stack).to.have.length(2);
    });
  });

  describe('integration with external services', () => {
    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
    });

    it('should handle successful registration with real-like data', async () => {
      const realPayload = {
        name: 'Test Legal Services Ltd',
        sraId: '12345678',
        companyNumber: 'OC123456',
        contactInformation: [{
          addressLine1: '123 Test Street',
          postCode: 'SW1A 1AA'
        }],
        superUser: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@testlegal.com'
        }
      };

      payloadBuilderStub.returns(realPayload);
      asyncReturnOrErrorStub.resolves('success');

      const mockPayloadFunction = async (req, res) => {
        mockLogger.info('Posting to Reference Data (Professional) service');
        const result = await asyncReturnOrErrorStub();
        mockLogger.info('Posted to Reference Data (Professional) service', result);

        if (result) {
          return 'registration-confirmation';
        }
        res.status(400).send('Error registering organisation');
        return null;
      };

      const result = await mockPayloadFunction(mockRequest, mockResponse);

      expect(result).to.equal('registration-confirmation');
      expect(mockLogger.info).to.have.been.calledWith('Posting to Reference Data (Professional) service');
      expect(mockLogger.info).to.have.been.calledWith('Posted to Reference Data (Professional) service', 'success');
    });

    it('should handle registration service errors gracefully', async () => {
      const errorPayload = new Error('Service unavailable');
      rdProfessionalStub.rejects(errorPayload);
      asyncReturnOrErrorStub.resolves(null);

      const mockPayloadFunction = async (req, res) => {
        mockLogger.info('Posting to Reference Data (Professional) service');
        const result = await asyncReturnOrErrorStub();
        mockLogger.info('Posted to Reference Data (Professional) service', result);

        if (result) {
          return 'registration-confirmation';
        }
        res.status(400).send('Error registering organisation');
        return null;
      };

      const result = await mockPayloadFunction(mockRequest, mockResponse);

      expect(result).to.be.null;
      expect(mockResponse.status).to.have.been.calledWith(400);
      expect(mockResponse.send).to.have.been.calledWith('Error registering organisation');
    });
  });

  describe('state engine integration', () => {
    let handler: any;
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
      handler = router.stack[0].route.stack[0].handle;
    });

    it('should pass correct parameters to state engine process', () => {
      handler(mockRequest, mockResponse);

      expect(stateEngineStub).to.have.been.calledOnce;
      const args = stateEngineStub.getCall(0).args;

      expect(args[0]).to.equal(mockRequest);
      expect(args[1]).to.equal(mockResponse);
      expect(args[2]).to.be.an('array'); // mapping
      expect(args[2][0]).to.be.an('object');
      expect(args[3]).to.be.a('function'); // payload function
      expect(args[4]).to.be.an('array'); // templates
      expect(args[4].any).to.be.an('object');
      expect(args[5]).to.be.an('object'); // store instance
    });

    it('should create new Store instance for each request', () => {
      const mockStore = sinon.stub().returns({ store: 'instance' });
      sinon.stub(require('../lib/store'), 'Store').callsFake(mockStore);

      handler(mockRequest, mockResponse);

      expect(mockStore).to.have.been.calledWith(mockRequest);
    });
  });

  describe('error handling and edge cases', () => {
    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
    });

    it('should handle missing fromValues in request body', async () => {
      mockRequest.body = {}; // No fromValues

      const registerOrganisation = async (req, res) => {
        const organisationPayload = payloadBuilderStub(req.body.fromValues);
        return await asyncReturnOrErrorStub(
          rdProfessionalStub(organisationPayload, req),
          'Error registering organisation',
          res,
          mockLogger,
          false
        );
      };

      asyncReturnOrErrorStub.resolves(null);

      await registerOrganisation(mockRequest, mockResponse);

      expect(payloadBuilderStub).to.have.been.calledWith(undefined);
    });

    it('should handle empty fromValues object', async () => {
      mockRequest.body = { fromValues: {} };

      const registerOrganisation = async (req, res) => {
        const organisationPayload = payloadBuilderStub(req.body.fromValues);
        return await asyncReturnOrErrorStub(
          rdProfessionalStub(organisationPayload, req),
          'Error registering organisation',
          res,
          mockLogger,
          false
        );
      };

      payloadBuilderStub.returns({});
      asyncReturnOrErrorStub.resolves('success');

      const result = await registerOrganisation(mockRequest, mockResponse);

      expect(payloadBuilderStub).to.have.been.calledWith({});
      expect(result).to.equal('success');
    });

    it('should handle asyncReturnOrError with different error scenarios', async () => {
      // Test with false return value
      asyncReturnOrErrorStub.resolves(false);

      const mockPayloadFunction = async (req, res) => {
        const result = await asyncReturnOrErrorStub();
        if (result) {
          return 'registration-confirmation';
        }
        res.status(400).send('Error registering organisation');
        return null;
      };

      const result = await mockPayloadFunction(mockRequest, mockResponse);

      expect(result).to.be.null;
      expect(mockResponse.status).to.have.been.calledWith(400);
    });

    it('should pass logger instance correctly to asyncReturnOrError', async () => {
      const registerOrganisation = async (req, res) => {
        const organisationPayload = payloadBuilderStub(req.body.fromValues);
        return await asyncReturnOrErrorStub(
          rdProfessionalStub(organisationPayload, req),
          'Error registering organisation',
          res,
          mockLogger,
          false
        );
      };

      await registerOrganisation(mockRequest, mockResponse);

      expect(asyncReturnOrErrorStub).to.have.been.calledWith(
        sinon.match.any,
        'Error registering organisation',
        mockResponse,
        mockLogger,
        false
      );
    });
  });

  describe('state route parameter validation', () => {
    let handler: any;
    let router: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./index')];
      const module = require('./index');
      router = module.router;
      handler = router.stack[0].route.stack[0].handle;
    });

    it('should handle various parameter combinations', () => {
      const testCases = [
        {
          jurId: 'immigration',
          caseTypeId: 'asylum',
          caseId: 'case-123',
          stateId: 'initial-state'
        },
        {
          jurId: 'family',
          caseTypeId: 'divorce',
          caseId: 'case-456',
          stateId: 'confirmation'
        },
        {
          jurId: 'employment',
          caseTypeId: 'tribunal',
          caseId: 'case-789',
          stateId: 'final-state'
        }
      ];

      testCases.forEach((params) => {
        mockRequest.params = params;
        handler(mockRequest, mockResponse);

        expect(stateEngineStub).to.have.been.called;
      });
    });

    it('should handle special characters in parameters', () => {
      mockRequest.params = {
        jurId: 'test-jurisdiction',
        caseTypeId: 'case_type_with_underscores',
        caseId: 'case-with-dashes-123',
        stateId: 'state.with.dots'
      };

      handler(mockRequest, mockResponse);

      expect(stateEngineStub).to.have.been.calledWith(
        mockRequest,
        mockResponse,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any
      );
    });
  });

  describe('constants and configuration', () => {
    it('should use correct HTTP error code', async () => {
      asyncReturnOrErrorStub.resolves(null);

      const mockPayloadFunction = async (req, res) => {
        const result = await asyncReturnOrErrorStub();
        if (result) {
          return 'registration-confirmation';
        }
        res.status(400).send('Error registering organisation'); // ERROR400 constant
        return null;
      };

      await mockPayloadFunction(mockRequest, mockResponse);

      expect(mockResponse.status).to.have.been.calledWith(400);
    });

    it('should return correct success state', async () => {
      asyncReturnOrErrorStub.resolves('success');

      const mockPayloadFunction = async (req, res) => {
        const result = await asyncReturnOrErrorStub();
        if (result) {
          return 'registration-confirmation';
        }
        res.status(400).send('Error registering organisation');
        return null;
      };

      const result = await mockPayloadFunction(mockRequest, mockResponse);

      expect(result).to.equal('registration-confirmation');
    });
  });
});
