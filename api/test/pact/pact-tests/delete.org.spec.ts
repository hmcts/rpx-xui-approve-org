import { Pact } from '@pact-foundation/pact'
import {eachLike} from '@pact-foundation/pact/dsl/matchers';
import { expect } from 'chai'
import * as path from 'path'
import {deleteOrganisation, getActiveUsersForOrganisaiton} from '../../pactUtil';
import {OrganisationUsers} from '../../pactFixtures';

import * as getPort from "get-port";
const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

let mockServerPort: number;
let provider: Pact;

// /refdata/internal/v1/organisations/${req.params.id}/users?returnRoles=false`

xdescribe("Retrieves the Users of an Active Organisation based on the showDeleted Flag ", async() => {
  mockServerPort = await getPort()
  const userId:string  = "userId1500";

  provider = new Pact({
    port: mockServerPort,
    log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
    spec: 2,
    consumer: "XUIWebapp",
    provider: "RDProfessional_API",
    pactfileWriteMode: "merge",
  })

  // Setup the provider
  before(() => provider.setup())
  // Write Pact when all tests done
  after(() => provider.finalize())
  // verify with Pact, and reset expectations
  afterEach(() => provider.verify())
  // /refdata/internal/v1/organisations/${req.params.id}/users?returnRoles=false`

  describe("DELETE active Users of organistaion given Deletable Status", () => {

    before(done => {
      const interaction = {
        state: "Users exists",
        uponReceiving: "Receiving a request to DELETE active Users for the Organisation",
        withRequest: {
          method: "DELETE",
          path: "/refdata/internal/v1/organisations/"+userId+"/users",
          query:"returnRoles=false",
          headers: {
            "Authorization": "Bearer some-access-token",
            "Content-Type": "application/json",
            "ServiceAuthorization": "ServiceAuthToken"
          },
        },
        willRespondWith: {
          status: 204,
          headers: {
            "Content-Type": "application/json",
          },
          body: activeUsersOfOrgansationDto,
        },
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })
    it("Returns the correct response", (done) => {
      const taskUrl = `${provider.mockService.baseUrl}/refdata/internal/v1/organisations/${userId}/users?returnRoles=false`;

      const response:Promise<any>  = deleteOrganisation(taskUrl);

      response.then((axiosResponse) => {
        const dto:OrganisationUsers = <OrganisationUsers> axiosResponse.data;
       // assertResponses(dto);
      }).then(done,done)
    })
  })
})


function assertResponses(dto:OrganisationUsers){
  //expect(dto.email).to.be.equal('joe.bloggs@hmcts.net');
  expect(dto.firstName).to.be.equal('Joe');
  expect(dto.lastName).to.be.equal('Bloggs');
  //expect(dto.idamMessage).to.be.equal('Bloggs');
  //expect(dto.idamStatus).to.be.equal('Bloggs');
  //expect(dto.roles[0]).to.be.equal('solicitor');
}

const activeUsersOfOrgansationDto:OrganisationUsers = {
  email:somethingLike("Joe.Bloggs@hmcts.net"),
  firstName: somethingLike("Joe"),
  lastName: somethingLike("Bloggs"),
  idamMessage: somethingLike("Succesfully updated"),
  idamStatus: somethingLike("updated"),
  idamStatusCode:somethingLike("200"),
  roles: [
    eachLike[
      ("solicitor")
      ]
  ],
  userIdentifier:"userIdentifier"
}
