import { Pact } from '@pact-foundation/pact';
import { expect } from 'chai';
import * as getPort from "get-port";
import * as path from 'path';
import { idamGetUserDetails } from '../../../pactUtil';

const { Matchers } = require('@pact-foundation/pact');
const { somethingLike } = Matchers;

let mockServerPort: number;
let provider: Pact;

describe("Idam API user details", async () => {
  await new Promise(resolve => setTimeout(resolve, 3000));

  mockServerPort = await getPort()
  provider = new Pact({
    port: mockServerPort,
    log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
    spec: 2,
    consumer: "xui_approveorg",
    provider: "Idam_api",
    pactfileWriteMode: "merge",
  })

  //Setup the provider
  before(() => provider.setup())
  // Write Pact when all tests done
  after(() => provider.finalize())
  // verify with Pact, and reset expectations
  afterEach(() => provider.verify())

  const RESPONSE_BODY = {
    "id": somethingLike("abc123"),
    "forename": somethingLike("Joe"),
    "surname": somethingLike("Bloggs"),
    "email": somethingLike("joe.bloggs@hmcts.net"),
    "active": somethingLike(true),
    "roles": somethingLike([
      somethingLike("solicitor"), somethingLike("caseworker")
    ])
  }

  describe("Get user details from Idam", () => {

    const jwt = 'some-access-token';

    before(done => {
      const interaction = {
        state: "a user exists",
        uponReceiving: "sidam_user_details will respond with:",
        withRequest: {
          method: "GET",
          path: "/details",
          headers: {
            Authorization: "Bearer some-access-token"
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: RESPONSE_BODY,
        },
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })

    })

    it("Returns the user details from IDAM", (done) => {
      const taskUrl = `${provider.mockService.baseUrl}/details`;
      const response = idamGetUserDetails(taskUrl);

      response.then((axiosResponse) => {
        const dto: IdamGetDetailsResponseDto = <IdamGetDetailsResponseDto>axiosResponse.data;
        assertResponses(dto);
      }).then(done, done)
    })
  })
})

function assertResponses(dto: IdamGetDetailsResponseDto) {
  expect(dto.active).to.be.equal(true);
  expect(dto.email).to.be.equal('joe.bloggs@hmcts.net');
  expect(dto.forename).to.be.equal('Joe');
  expect(dto.surname).to.be.equal('Bloggs');
  expect(dto.roles[0]).to.be.equal('solicitor');
  expect(dto.roles[1]).to.be.equal('caseworker');
}

export interface IdamGetDetailsResponseDto {
  id: string,
  forename: string,
  surname: string,
  email: string,
  active: boolean
  roles: string[]
}
