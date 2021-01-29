import { Pact } from '@pact-foundation/pact';
import { expect } from 'chai';
import * as getPort from 'get-port';
import * as path from 'path';
import { Organisation } from '../../pactFixtures';
import { getOperation } from "../../pactUtil";

const {Matchers} = require('@pact-foundation/pact');
const {somethingLike, like, eachLike} = Matchers;

describe("Get a list of organisations based on status", () => {
  let mockServerPort: number
  let provider: Pact

  // Setup the provider
  before(async() => {
    await new Promise(resolve => setTimeout(resolve, 3000));

    mockServerPort = await getPort()
    provider = new Pact({
      consumer: "xui_approveorg",
      provider: "rd_professional_api",
      log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
      dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
      logLevel: 'info',
      port: mockServerPort,
      spec: 2,
      pactfileWriteMode: "merge"
    })
    return provider.setup()
  })

  // Write Pact when all tests done
  after(() => provider.finalize())

  // verify with Pact, and reset expectations
  afterEach(() => provider.verify())

  describe("Get Organisations", () => {

    const jwt = 'some-access-token'

    before(done => {
      const interaction = {
        state: "Organisations exists in the ref data",
        uponReceiving: "On receiving get Organisation",
        withRequest: {
          method: "GET",
          path: "/refdata/internal/v1/organisations",
          query: "status=Active",
          headers: {
            'Content-Type': 'application/json',
            "Authorization":  "Bearer some-access-token",
            "ServiceAuthorization": "ServiceAuthToken"
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: getOrganisationResponse,
        },
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })

    it("Returns a list of organisations based on status", done => {
      const path: string = `${provider.mockService.baseUrl}/refdata/internal/v1/organisations?status=Active`;
      const resp =  getOperation(path);
      resp.then((response) => {
        const responseDto:Organisation[] = <Organisation[]> response.data
        assertResponse(responseDto);
      }).then(done,done)
    })
   })
})

function assertResponse(dto:Organisation[]): void{
  expect(dto).to.be.not.null;
  for(var element of dto ) {
    expect(element.companyNumber).to.equal("A1000");
    expect(element.companyUrl).to.equal("www.google.com");
    expect(element.sraId).to.equal("sraId");
    expect(element.organisationIdentifier).to.equal("K100");
    expect(element.superUser.firstName).to.equal("Joe");
    expect(element.superUser.lastName).to.equal("Bloggs");
  }
}

const getOrganisationResponse:Organisation[] = [
  {
    companyNumber:somethingLike('A1000'),
    companyUrl: somethingLike('www.google.com'),
    name: somethingLike('TheOrganisation'),
    organisationIdentifier: somethingLike('K100'),
    sraId: somethingLike('sraId'),
    sraRegulated: somethingLike(true),
    status: somethingLike('success'),
    contactInformation: {
      addressLine1: somethingLike("pettyfrance"),
      addressLine2: somethingLike("London"),
      addressLine3: somethingLike("near palace"),
      country: somethingLike("UK"),
      county: somethingLike("Westminster"),
      postCode: somethingLike("WC1A3BD"),
      townCity: somethingLike("Westminster")
    },
    superUser: {
      firstName:somethingLike("Joe"),
      lastName:somethingLike("Bloggs"),
      email:somethingLike("this@that.com")
    },
    paymentAccount: somethingLike(["abckd"])
  }
]
