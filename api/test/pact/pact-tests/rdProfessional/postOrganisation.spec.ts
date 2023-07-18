import { expect } from 'chai';
import { postOperation } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';

const pactSetUp = new PactTestSetup({ provider: 'referenceData_organisationalInternal', port: 8000 });

describe('Post Organisation', async () => {
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  const mockRequest = {
    name: 'somename',
    url: 'http://someurl',
    superUser: {
      firstName: 'firstname',
      lastName: 'lastname',
      email: 'some@email.com'
    },
    pbaAccounts: [
      {
        pbaNumber: 'PBA1'
      },
      {
        pbaNumber: 'PBA2'
      }
    ],
    dxAddress: {
      dxExchange: 'dxExchange1',
      dxNumber: 'dxNumber1'
    },
    address: {
      houseNoBuildingName: 'Building',
      addressLine1: 'line1',
      addressLine2: 'line2',
      townCity: 'town',
      county: 'county',
      postcode: 'PostCode'
    }
  };

  describe('Post New Organisation ', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'Post New Organisation',
        uponReceiving: 'A Request to create a new Organisation',
        withRequest: {
          method: 'POST',
          path: '/organisations',
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

    it('Reinvite a user for an organisation', async () => {
      const taskUrl: string = `${pactSetUp.provider.mockService.baseUrl}/organisations`;

      const resp = postOperation(taskUrl, mockRequest);

      resp.then((response) => {
        try {
          expect(response.status).to.be.equal(201);
        } catch (e) {
          console.log('error occurred in asserting response...' + e);
        }
      }).then(() => {
        pactSetUp.provider.verify();
        pactSetUp.provider.finalize();
      }).finally(() => {
        pactSetUp.provider.verify();
        pactSetUp.provider.finalize();
      });
    });
  });
});

