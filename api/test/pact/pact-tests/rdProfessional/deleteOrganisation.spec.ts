import { expect } from 'chai';
import { deleteOperation } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';

const pactSetUp = new PactTestSetup({ provider: 'referenceData_organisationalInternal', port: 8000 });



describe('Delete active Users of organistaion based on the showDeleted Flag ', async () => {
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  const organisationId: string = '12345678';

  describe('Delete active Users of organistaion given status', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'Users exists for an Organisation',
        uponReceiving: 'Receiving a request to DELETE active Users for the Organisation',
        withRequest: {
          method: 'DELETE',
          path: '/refdata/internal/v1/organisations/' + organisationId,
          headers: {
            'Authorization': 'Bearer some-access-token',
            'Content-Type': 'application/json',
            'ServiceAuthorization': 'ServiceAuthToken'
          }
        },
        willRespondWith: {
          status: 204,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      };
      // @ts-ignore
      pactSetUp.provider.addInteraction(interaction);
    });

    it('Delete users from organisation and return the correct response code', async () => {
      const taskUrl = `${pactSetUp.provider.mockService.baseUrl}/refdata/internal/v1/organisations/${organisationId}`;
      const response = deleteOperation(taskUrl);
      response.then((axiosResponse) => {
        expect(axiosResponse.status).to.be.equal(204);
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
