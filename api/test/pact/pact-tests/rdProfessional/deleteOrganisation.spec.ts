import { Pact } from '@pact-foundation/pact';
import { expect } from 'chai';
import * as getPort from "get-port";
import * as path from 'path';
import { OrganisationUsers } from '../../../pactFixtures';
import { deleteOperation } from '../../../pactUtil';
const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

let mockServerPort: number;
let provider: Pact;

describe("DELETE active Users of organistaion based on the showDeleted Flag ", async() => {
  mockServerPort = await getPort()
  const userId:string  = "userId1500";

  // Setup the provider
  before(async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));

    mockServerPort = await getPort()
    provider = new Pact({
      consumer: 'xui_approveorg',
      log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
      dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
      logLevel: 'info',
      port: mockServerPort,
      provider: 'rd_professional_api', //
      spec: 2,
      pactfileWriteMode: "merge"
    })
    return provider.setup()
 })

  // Write Pact when all tests done
  after(() => provider.finalize())
  // verify with Pact, and reset expectations
  afterEach(() => provider.verify())

  let mockResponse:OrganisationUsers ={
    email:somethingLike("joe.bloggs@hmcts.net"),
    firstName: somethingLike("joe"),
    lastName: somethingLike("bloggs"),
    idamMessage: somethingLike("Success"),
    idamStatus: somethingLike("updated"),
    idamStatusCode:somethingLike("200"),
    roles: somethingLike(["solcitor","attorney"]),
    userIdentifier:somethingLike("userIdentifier")
  }

  describe("Delete active Users of organistaion given status", () => {

    before(done => {
      const interaction = {
        state: "Users exists",
        uponReceiving: "Receiving a request to DELETE active Users for the Organisation",
        withRequest: {
          method: "DELETE",
          path:"/refdata/internal/v1/organisations/"+userId+"/users",
          query:"returnRoles=false",
          headers: {
            "Authorization": "Bearer some-access-token",
            "Content-Type": "application/json",
            "ServiceAuthorization": "ServiceAuthToken"
          }
        },
        willRespondWith: {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
        }
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })


    it("Delete users from organisation and return the correct response code", (done) => {
      const taskUrl = `${provider.mockService.baseUrl}/refdata/internal/v1/organisations/${userId}/users?returnRoles=false`;
      const response  = deleteOperation(taskUrl);
      response.then((axiosResponse) => {
        expect(axiosResponse.status).to.be.equal(204);
      }).then(done,done)
    })
  })
})
