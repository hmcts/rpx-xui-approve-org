import { Pact } from '@pact-foundation/pact';
import {expect} from 'chai';
import * as getPort from 'get-port';
import * as path from 'path';
import {getOperation} from "../../../pactUtil";
import {OrganisationUsers} from '../../../pactFixtures';

const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

xdescribe('/GET Retrieve list of users  of an organisation based on delete status ', () => {

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
    "case_type_id": somethingLike("ecb5edf4-2f5f-4031-a0ec"),
    "case_id":somethingLike("1583841721773828"),
    "assignee_id":somethingLike("PROBATE")
  }

  let mockResponse = [
    {
      "email": somethingLike("bill.roberts@greatbrsolicitors.co.uk"),
      "firstName": somethingLike("bill"),
      "idamMessage": somethingLike("idamMessage"),
      "idamStatusCode": somethingLike("success"),
      "lastName": somethingLike("roberts"),
      "roles": somethingLike(["Claimant", "Attorney"]),
      "userIdentifier": somethingLike("userIdentifier")
    }
  ]

  describe('Retrieve list of users  of an organisation based on delete status flag', () => {
    before(done =>{
      const interaction = {
        state: 'Then a status message is returned',
        uponReceiving: 'A request for  Users of an Active Organisation based on Deleteable Status',
        withRequest: {
          method: "GET",
          path:"/refdata/internal/v1/organisations/"+orgnId,
          query:"returnRoles=false",
          headers: {
            "Content-Type": "application/json",
            "ServiceAuthorization": "ServiceAuthToken",
            "Authorization": "Bearer some-access-token"
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          },
          body: {mockResponse2: mockResponse},
        }
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })

    it('Returns Users of an Active Organisation based on the showDelete flag ', async () => {
      const taskUrl:string  = `${provider.mockService.baseUrl}/refdata/internal/v1/organisations/orgn1500?returnRoles=false`;
      const resp =  getOperation(taskUrl)

      resp.then((axResponse) => {
        expect(axResponse.status).to.be.equal(200);
        const responseDto:OrganisationUsers[] = <OrganisationUsers[]> axResponse.data
        try{
          assertOrganisationUsers(responseDto);
        }catch(e){
          e.toString(`~~~~~ Error when trying to assert the response from the call to the ${taskUrl}` +e);
        }
      })
    })
  })
})

function assertOrganisationUsers(response:OrganisationUsers[]){
  expect(response[0].firstName).to.be.equal('bill');
  expect(response[0].lastName).to.be.equal('roberts');
  expect(response[0].idamMessage).to.be.equal('idamMessage');
  expect(response[0].idamStatusCode).to.be.equal('success');
  expect(response[0].userIdentifier).to.be.equal('userIdentifier');
  expect(response[0].roles[0]).to.be.equal('Claimant','Attorney');
}
