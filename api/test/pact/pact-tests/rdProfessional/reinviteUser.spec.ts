import { expect } from 'chai';
import { UserAddedResponse } from "../../../pactFixtures";
import { postOperation } from "../../../pactUtil";
import { PactTestSetup } from '../settings/provider.mock';


const { Matchers } = require('@pact-foundation/pact');
const { somethingLike } = Matchers;
const pactSetUp = new PactTestSetup({ provider: 'referenceData_organisationalInternal', port: 8000 });


describe('Reinvite a User', async () => {
  before(async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
   })

  const orgnId = "UTVC86X";

  let mockRequest = {
    "firstName": "joe",
    "lastName": "bloggs",
    "email": "joe.blogss@hmcts.net",
    "roles": [
      "claimant"
    ],
    "resendInvite": true
  }

  describe('Reinvite User by adding the user to an organisation ', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'User invited to Organisation',
        uponReceiving: 'A Request to Reinvite user to the organisationd',
        withRequest: {
          method: "POST",
          path: "/refdata/internal/v1/organisations/" + orgnId + "/users/",
          body: mockRequest,
          headers: {
            "Content-Type": "application/json",
            "ServiceAuthorization": "ServiceAuthToken",
            "Authorization": "Bearer some-access-token"
          }
        },
        willRespondWith: {
          status: 201
        }
      }
      // @ts-ignore
      pactSetUp.provider.addInteraction(interaction)

    })

    it('Reinvite a user for an organisation', async () => {
      const taskUrl: string = `${pactSetUp.provider.mockService.baseUrl}/refdata/internal/v1/organisations/` + orgnId + "/users/";

      const resp = postOperation(taskUrl, mockRequest)

      resp.then((response) => {
        try {
          const responseDto: UserAddedResponse = <UserAddedResponse>response.data
          expect(response.status).to.be.equal(201);
        } catch (e) {
          console.log(`error occurred in asserting response...` + e)
        }
      }).then(() => {
        pactSetUp.provider.verify(),
        pactSetUp.provider.finalize()
      })
    })
  })
})

