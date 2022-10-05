import { postLease } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';


const { Matchers } = require('@pact-foundation/pact');
const { string } = Matchers;

const s2sResponseSecret = 'someMicroServiceToken';
const pactSetUp = new PactTestSetup({ provider: 's2s_auth', port: 8000 });

const payload = {
  "microservice": "rpx_xui_approve-org",
  "oneTimePassword": "784467"
}

describe("s2s API lease", async () => {
  before(async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
   })

  describe("POST  /lease", () => {

    const jwt = 'some-access-token';

    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: "microservice with valid credentials",
        uponReceiving: "a request for a token for a microservice",
        withRequest: {
          method: "POST",
          path: "/lease",
          body: payload,
          headers: {
            "Content-Type": "application/json"
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "text/plain;charset=ISO-8859-1",
          },
          body: string(s2sResponseSecret),
        },
      }
      // @ts-ignore
      pactSetUp.provider.addInteraction(interaction).then(() => {
      })
    })
    it("Returns the token from S2S Service", async () => {

      const taskUrl = `${pactSetUp.provider.mockService.baseUrl}/lease  `;
      const response = postLease(taskUrl, payload);

      response.then((axiosResponse) => {
        try {
        const idamResponse: string = axiosResponse.data;
      } catch (e) {
        console.log(`error occurred in asserting response...` + e)
      }
      }).then(() => {
        pactSetUp.provider.verify()
        pactSetUp.provider.finalize()
      }).finally(() => {
        pactSetUp.provider.verify()
        pactSetUp.provider.finalize()
      })
    })
  })
})
