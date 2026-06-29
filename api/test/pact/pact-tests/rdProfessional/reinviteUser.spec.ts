import { expect } from 'chai';
import { postOperation } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';

const pactSetUp = new PactTestSetup({ provider: 'referenceData_organisationalInternal', port: 8000 });

describe('Reinvite a User', () => {
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  const orgnId = 'UTVC86X';

  const mockRequest = {
    'firstName': 'joe',
    'lastName': 'bloggs',
    'email': 'joe.blogss@hmcts.net',
    'roles': [
      'claimant'
    ],
    'resendInvite': true
  };

  describe('Reinvite User by adding the user to an organisation ', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'User invited to Organisation',
        uponReceiving: 'A Request to Reinvite user to the organisationd',
        withRequest: {
          method: 'POST',
          path: '/refdata/internal/v1/organisations/' + orgnId + '/users/',
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
      await pactSetUp.provider.addInteraction(interaction);
    });

    afterEach(async () => {
      await pactSetUp.provider.verify();
    });

    after(async () => {
      await pactSetUp.provider.finalize();
    });

    it('Reinvite a user for an organisation', async () => {
      const taskUrl: string = `${pactSetUp.provider.mockService.baseUrl}/refdata/internal/v1/organisations/` + orgnId + '/users/';
      const response = await postOperation(taskUrl, mockRequest);
      expect(response.status).to.be.equal(201);
    });
  });
});
