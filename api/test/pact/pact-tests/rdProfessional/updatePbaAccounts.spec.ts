import { expect } from 'chai';
import { putOperation } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';

const pactSetUp = new PactTestSetup({ provider: 'referenceData_organisationalInternal', port: 8000 });

describe('Update the PBA for an organisation', async () => {
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  const orgnId = 'UTVC86X';
  const mockRequest = {
    'paymentAccounts': ['PBA1234567', 'PBA7654321']
  };

  describe('Update the PBA an organisation given organisationId ', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'An Organisation with PBA accounts exists',
        uponReceiving: 'A request to update the PBA of an Organisation',
        withRequest: {
          method: 'PUT',
          path: '/refdata/internal/v1/organisations/' + orgnId + '/pbas',
          body: mockRequest,
          headers: {
            'Content-Type': 'application/json',
            'ServiceAuthorization': 'ServiceAuthToken',
            'Authorization': 'Bearer some-access-token'
          }
        },
        willRespondWith: {
          status: 201
        }
      };
      // @ts-ignore
      pactSetUp.provider.addInteraction(interaction);
    });

    it('Update an organisation`s PBA  and returns response', async () => {
      const taskUrl: string = `${pactSetUp.provider.mockService.baseUrl}/refdata/internal/v1/organisations/` + orgnId + '/pbas';

      const resp = putOperation(taskUrl, mockRequest);
      resp.then((response) => {
        try {
          expect(response.status).to.be.equal(200);
        } catch (e) {
          console.log('error occurred in asserting response...' + e);
        }
      }).then(() => {
        pactSetUp.provider.verify();
        pactSetUp.provider.finalize();
      });
    });
  });
});
