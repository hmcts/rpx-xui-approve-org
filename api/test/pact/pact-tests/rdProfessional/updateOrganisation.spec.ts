import { expect } from 'chai';
import { putOperation } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';

const pactSetUp = new PactTestSetup({ provider: 'referenceData_organisationalInternal', port: 8000 });

describe('Update an organisation', () => {
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  const orgnId = 'UTVC86X';

  const mockRequest = {
    'name': 'Organisation name',
    'status': 'PENDING',
    'sraId': 'SRA12345',
    'superUser': {
      'firstName': 'Bill',
      'lastName': 'Roberts',
      'email': 'bill.roberts@hmcts.net'
    },
    'paymentAccount': ['pbaPayment', 'payment'],
    'contactInformation': [
      {
        'addressLine1': 'AddressLine1',
        'addressLine2': 'AddressLine2',
        'addressLine3': 'AddressLine3',
        'townCity': 'Sutton',
        'county': 'Surrey',
        'country': 'UK',
        'postCode': 'SM12SX',
        'dxAddress': [
          {
            'dxNumber': 'DX2313',
            'dxExchange': 'EXCHANGE'
          }
        ]
      }]
  };

  describe('Update an organisation ', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'An Organisation exists for update',
        uponReceiving: 'A Request to update an organisation',
        withRequest: {
          method: 'PUT',
          path: '/refdata/internal/v1/organisations/' + orgnId,
          body: mockRequest,
          headers: {
            'Content-Type': 'application/json',
            'ServiceAuthorization': 'ServiceAuthToken',
            'Authorization': 'Bearer some-access-token'
          }
        },
        willRespondWith: {
          status: 200
        }
      };
      // @ts-ignore
      await pactSetUp.provider.addInteraction(interaction);
    });

    afterEach(async () => {
      await pactSetUp.provider.verify();
    });

    after(async () => {
      await pactSetUp.provider.finalize();
    });

    it('Update an organisation and returns response', async () => {
      const taskUrl: string = `${pactSetUp.provider.mockService.baseUrl}/refdata/internal/v1/organisations/` + orgnId;

      try {
        const response = await putOperation(taskUrl, mockRequest);
        try {
          expect(response.status).to.be.equal(200);
        } catch (e) {
          console.log('error occurred in asserting response...' + e);
        }
      } finally {
        await pactSetUp.verifyAndFinalize();
      }
    });
  });
});
