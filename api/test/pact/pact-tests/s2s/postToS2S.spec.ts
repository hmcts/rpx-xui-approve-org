import { expect } from 'chai';
import { S2SResponse } from '../../../pactFixtures';
import { postS2SLease } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';

const pactSetUp = new PactTestSetup({ provider: 's2s_auth', port: 8000 });

describe('S2S Auth API', () => {
  describe('post S2S lease', () => {
    const mockRequest = {
      microservice: 'xui-webapp', oneTimePassword: 'exPassword'
    };

    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'microservice with valid credentials',
        uponReceiving: 'a request for a token',
        withRequest: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'ServiceAuthorization': 'ServiceAuthToken'
          },
          path: '/lease',
          body: mockRequest
        },
        willRespondWith: {
          headers: {
            'Content-Type': 'text/plain'
          },
          status: 200,
          body: 'someToken'
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

    it('returns the correct response', async () => {
      const s2sUrl: string = `${pactSetUp.provider.mockService.baseUrl}/lease`;
      const resp = await postS2SLease(s2sUrl, mockRequest);
      assertResponse(resp.data);
    });
  });
});

function assertResponse(dto: S2SResponse) {
  expect(dto).to.be.equal('someToken');
}
