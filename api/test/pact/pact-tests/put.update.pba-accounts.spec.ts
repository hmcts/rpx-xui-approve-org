import { Pact } from '@pact-foundation/pact';
import {expect} from 'chai';
import * as getPort from 'get-port';
import * as path from 'path';
import {putOperation} from "../../pactUtil";
const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

describe('/PUT Update the PBA for an organisation given organisationId', () => {

  const orgnId = "orgn1500";

  let mockServerPort: number;
  let provider: Pact;

  before(async () => {
    mockServerPort = await getPort()
    provider = new Pact({
      consumer: 'xui_approveorg',
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
    "paymentAccounts": ["pba","nonPba"]
   }

  let mockResponse:string ="Success";

  describe('Update the PBA an organisation given organisationId ', () => {
    before(done =>{
      const interaction = {
        state: 'Then a status message is returned',
        uponReceiving: 'A Request to update the PBA of an Organisation is received',
        withRequest: {
          method: "PUT",
          path:"/refdata/internal/v1/organisations/"+orgnId +"/pbas",
          body:mockRequest,
          headers: {
            "Content-Type": "application/json",
            "ServiceAuthorization": "ServiceAuthToken",
            "Authorization": "Bearer some-access-token"
          }
        },
        willRespondWith: {
          status: 200,
          body:mockResponse
        }
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })

    it('Update an organisation`s PBA  and returns success', async () => {
      const taskUrl:string  = `${provider.mockService.baseUrl}/refdata/internal/v1/organisations/`+orgnId+"/pbas";

      const resp =  putOperation(taskUrl, mockRequest )

      resp.then((response) => {
        try{
          const responseDto:string  =  response.data
          expect(response.status).to.be.equal(200);
        }catch(e){
          e.message(`error occurred in asserting response.`)
        }
      })
    })
  })
})
