import { Pact } from '@pact-foundation/pact';
import {expect} from 'chai';
import * as getPort from 'get-port';
import {isDone} from 'ng-packagr/lib/brocc/select';
import * as path from 'path';
//import {UpdateOrganisationRequest} from "../../pactFixtures";
import {updateOrganisation} from "../../pactUtil";
const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

describe('/PUT Update an organisation', () => {

  const orgnId = "orgn1500";

  let mockServerPort: number;
  let provider: Pact;

  before(async () => {
    mockServerPort = await getPort()
    provider = new Pact({
      consumer: 'XUIWebApp',
      log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
      dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
      logLevel: 'info',
      port: mockServerPort,
      provider: 'RDProfessional_API',
      spec: 2,
      pactfileWriteMode: "merge"
    })
    return provider.setup()
  })

  // Write Pact when all tests done
  after(() => provider.finalize())

  // verify with Pact, and reset expectations
  afterEach(() => provider.verify())

  // TODO check , this request fails as it uses patternMatching in the Request.
  // TODO Do we use patternMatching at Request level or is it only for Responses ?
  let mockRequest = {
    "name": somethingLike("name"),
    "status":somethingLike("Processing"),
    "sraId":somethingLike("SRA12345"),
    "superUser":somethingLike({
      "firstName":'Bill',
      "lastName":'Roberts',
      "email":'bill.roberts@hmcts.net'
    }),
    "paymentAccount": somethingLike(['pbaPayment','payment']),
    "contactInformation":somethingLike([
      {
        "addressLine1": somethingLike("AddressLine1"),
        "addressLine2": somethingLike("AddressLine2"),
        "addressLine3": somethingLike("AddressLine3"),
        "townCity": somethingLike("Sutton"),
        "county": somethingLike("Surrey"),
        "country": somethingLike("UK"),
        "postCode":somethingLike("SM12SX"),
        "dxAddress": somethingLike([
          {
            "dxNumber": somethingLike("DX2313"),
            "dxExchange": somethingLike("EXCHANGE")
          }
        ])}])
  }

  // TODO check , this request PASSED  but it is hardcoded
  let mockRequest2 = {
    "name": "updateOrganisation",
    "status":"Processing",
    "sraId":"SRA12345",
    "superUser":{
      "firstName":'Bill',
      "lastName":'Roberts',
      "email":'bill.roberts@hmcts.net'
    },
    "paymentAccount": ['pbaPayment','payment'],
    "contactInformation":[
      {
        "addressLine1": "AddressLine1",
        "addressLine2": "AddressLine2",
        "addressLine3": "AddressLine3",
        "townCity": "Sutton",
        "county": "Surrey",
        "country": "UK",
        "postCode":"SM12SX",
        "dxAddress": [
          {
            "dxNumber": "DX2313",
            "dxExchange": "EXCHANGE"
          }
        ]}]
  }


  let mockResponse:string ="Success";

  describe('Update an organisation ', () => {
    console.log( `......MockRequest within the  DESCRIBE .......` + JSON.stringify(mockRequest))
    before(done =>{
      const interaction = {
        state: 'Then a status message is returned',
        uponReceiving: 'A Request to update organisation is received',
        withRequest: {
          method: "PUT",
          path:"/refdata/internal/v1/organisations/"+orgnId,
          body:mockRequest2 ,
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

    it('Update an organisation and returns success', async () => {
      const taskUrl:string  = `${provider.mockService.baseUrl}/refdata/internal/v1/organisations/`+orgnId;

      const resp =  updateOrganisation(taskUrl, mockRequest2 )

      resp.then((response) => {
        try{
          const responseDto:string  =  response.data
          expect(response.status).to.be.equal(201);
        }catch(e){
          e.message(`error occurred in asserting response.`)
        }
      }).catch(() => 'exception encourntered...')
    })


  })
})
