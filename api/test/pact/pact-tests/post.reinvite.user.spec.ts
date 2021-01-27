import { Pact } from '@pact-foundation/pact';
import {expect} from 'chai';
import * as getPort from 'get-port';
import {isDone} from 'ng-packagr/lib/brocc/select';
import * as path from 'path';
import {postOperation} from "../../pactUtil";
import {UserAddedResponse} from "../../pactFixtures"
const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

describe('/POST  Reinvite User', () => {

  const orgnId = "orgn1500";

  let mockServerPort: number;
  let provider: Pact;

  before(async () => {
    mockServerPort = await getPort()
    provider = new Pact({
      consumer: 'xui_approve_org_oidc',
      log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
      dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
      logLevel: 'info',
      port: mockServerPort,
      provider: 'rd_professional_api',
      spec: 2,
      pactfileWriteMode: "merge"
    })
    return provider.setup()
  })

  // Write Pact when all tests done
  after(() => provider.finalize())

  // verify with Pact, and reset expectations
  afterEach(() => provider.verify())

  let mockRequest = {
    "firstName": "joe",
    "lastName": "bloggs",
    "email": "joe.blogss@hmcts.net",
    "roles": [
      "claimant"
    ],
    "resendInvite": true
  }

  let mockResponse = {
     "idamStatus": somethingLike("User Added Successfully"),
     "userIdentifier": somethingLike("User123456")
  }

  describe('Reinvite User by adding the user to an organisation ', () => {
    before(done =>{
      const interaction = {
        state: 'Then a status message is returned',
        uponReceiving: 'A Request to Reinvite user to the organisation is received',
        withRequest: {
          method: "POST",
          path:"/refdata/internal/v1/organisations/"+orgnId,
          body:mockRequest ,
          headers: {
            "Content-Type": "application/json",
            "ServiceAuthorization": "ServiceAuthToken",
            "Authorization": "Bearer some-access-token"
          }
        },
        willRespondWith: {
          status: 201,
          body:mockResponse
        }
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })

    it('Reinvite a user for an organisation and returns success', async () => {
      const taskUrl:string  = `${provider.mockService.baseUrl}/refdata/internal/v1/organisations/`+orgnId;

      const resp =  postOperation(taskUrl, mockRequest )

      resp.then((response) => {
        try{
          const responseDto:UserAddedResponse  = <UserAddedResponse> response.data
          expect(response.status).to.be.equal(201);
          assertResponses(responseDto);
        }catch(e){
          e.message(`error occurred in asserting response...`)
        }
      })
    })
  })
})

function assertResponses(response:UserAddedResponse){
  expect(response.idamStatus).to.be.equal('User Added Successfully');
  expect(response.userIdentifier).to.be.equal('User123456');
}
