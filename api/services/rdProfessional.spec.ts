import { expect } from '../test/shared/testSetup';
import 'mocha';
import * as sinon from 'sinon';
import { createMockEnhancedRequest } from '../test/shared/authMocks';

describe('services/rdProfessional', () => {
  let configStub: any;
  let mockLogger: any;
  let mockRequest: any;
  let getLoggerStub: any;

  beforeEach(() => {
    configStub = sinon.stub();
    configStub.withArgs('services.rdProfessionalApi').returns('https://rd-professional-api.example.com');

    mockLogger = {
      info: sinon.stub(),
      debug: sinon.stub()
    };

    getLoggerStub = sinon.stub().returns(mockLogger);
    mockRequest = createMockEnhancedRequest();

    sinon.stub(require('../configuration'), 'getConfigValue').callsFake(configStub);
    sinon.stub(require('../lib/log4jui'), 'getLogger').callsFake(getLoggerStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('postOrganisation', () => {
    let postOrganisation: any;

    beforeEach(() => {
      delete require.cache[require.resolve('./rdProfessional')];
      const module = require('./rdProfessional');
      postOrganisation = module.postOrganisation;
    });

    it('should post organisation data to RD Professional API', async () => {
      const orgData = {
        name: 'Test Organisation',
        address: '123 Test Street',
        email: 'contact@test.org'
      };

      const mockResponse = {
        data: {
          organisationIdentifier: 'ORG12345',
          status: 'ACTIVE'
        }
      };

      mockRequest.http.post.resolves(mockResponse);

      const result = await postOrganisation(orgData, mockRequest);

      expect(mockRequest.http.post).to.have.been.calledWith(
        'https://rd-professional-api.example.com/organisations',
        orgData
      );

      expect(result).to.equal(mockResponse.data);
    });

    it('should create logger with correct category', async () => {
      const orgData = { name: 'Test Org' };
      mockRequest.http.post.resolves({ data: 'success' });

      await postOrganisation(orgData, mockRequest);

      expect(getLoggerStub).to.have.been.calledWith('rd-professional');
    });

    it('should log organisation body info', async () => {
      const orgData = {
        name: 'Legal Firm Ltd',
        contactInformation: [
          { addressLine1: '123 Law Street', postCode: 'L1 1AA' }
        ]
      };

      mockRequest.http.post.resolves({ data: { id: 'org123' } });

      await postOrganisation(orgData, mockRequest);

      expect(mockLogger.info).to.have.been.calledWith('Post organisation body');
    });

    it('should debug log the organisation data as JSON', async () => {
      const orgData = {
        name: 'Test Organisation',
        status: 'PENDING'
      };

      mockRequest.http.post.resolves({ data: { id: 'org456' } });

      await postOrganisation(orgData, mockRequest);

      expect(mockLogger.debug).to.have.been.calledWith(JSON.stringify(orgData));
    });

    it('should use configured RD Professional API URL', async () => {
      const orgData = { name: 'Test Org' };
      mockRequest.http.post.resolves({ data: 'success' });

      await postOrganisation(orgData, mockRequest);

      expect(configStub).to.have.been.calledWith('services.rdProfessionalApi');
      expect(mockRequest.http.post).to.have.been.calledWith(
        'https://rd-professional-api.example.com/organisations',
        orgData
      );
    });

    it('should handle different API base URLs', async () => {
      configStub.withArgs('services.rdProfessionalApi').returns('https://different-rd-api.gov.uk');

      delete require.cache[require.resolve('./rdProfessional')];
      const module = require('./rdProfessional');
      const postOrganisation = module.postOrganisation;

      const orgData = { name: 'Test Org' };
      mockRequest.http.post.resolves({ data: 'success' });

      await postOrganisation(orgData, mockRequest);

      expect(mockRequest.http.post).to.have.been.calledWith(
        'https://different-rd-api.gov.uk/organisations',
        orgData
      );
    });

    it('should return only response data, not full response object', async () => {
      const orgData = { name: 'Test Org' };
      const mockResponse = {
        data: { organisationId: 'ORG789', name: 'Test Org' },
        status: 201,
        statusText: 'Created',
        headers: {}
      };

      mockRequest.http.post.resolves(mockResponse);

      const result = await postOrganisation(orgData, mockRequest);

      expect(result).to.equal(mockResponse.data);
      expect(result).not.to.have.property('status');
      expect(result).not.to.have.property('headers');
    });

    it('should handle complex organisation data structures', async () => {
      const complexOrgData = {
        name: 'Complex Legal Firm',
        status: 'ACTIVE',
        sraId: 'SRA123456',
        sraRegulated: true,
        companyNumber: 'CN12345678',
        companyUrl: 'https://example-law-firm.com',
        contactInformation: [
          {
            addressLine1: '123 Legal Street',
            addressLine2: 'Suite 100',
            townCity: 'London',
            county: 'Greater London',
            country: 'UK',
            postCode: 'SW1A 1AA',
            dxAddress: [
              {
                dxNumber: '12345',
                dxExchange: 'London'
              }
            ]
          }
        ],
        organisationProfile: {
          organisationTypeId: 'SOLICITOR_ORG',
          organisationSectorId: 'OTHER'
        }
      };

      mockRequest.http.post.resolves({ data: { id: 'complex-org' } });

      const result = await postOrganisation(complexOrgData, mockRequest);

      expect(mockRequest.http.post).to.have.been.calledWith(
        sinon.match.string,
        complexOrgData
      );
      expect(mockLogger.debug).to.have.been.calledWith(JSON.stringify(complexOrgData));
    });

    it('should propagate axios errors', async () => {
      const orgData = { name: 'Test Org' };
      const error = new Error('API Error');

      mockRequest.http.post.rejects(error);

      try {
        await postOrganisation(orgData, mockRequest);
        expect.fail('Expected function to throw');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });

    it('should handle empty organisation data', async () => {
      const orgData = {};
      mockRequest.http.post.resolves({ data: null });

      const result = await postOrganisation(orgData, mockRequest);

      expect(mockRequest.http.post).to.have.been.calledWith(
        sinon.match.string,
        orgData
      );
      expect(mockLogger.debug).to.have.been.calledWith('{}');
      expect(result).to.be.null;
    });
  });
});
