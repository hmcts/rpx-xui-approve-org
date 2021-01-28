import { Pact } from '@pact-foundation/pact'
import { expect } from 'chai'
import * as path from 'path'
import * as getPort from "get-port";
import {eachLike} from "@pact-foundation/pact/dsl/matchers";
import arrayContaining = jasmine.arrayContaining;
import {getUserDetails} from '../../../../services/idam';
import {postLease} from '../../../pactUtil';

const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

let mockServerPort: number;
let provider: Pact;

const s2sResponseSecret = 'byJhbFciOiJIUzUxMiJ9.' +
  'eyJzdWIiOiJlbV9ndyIsImV4cCI6MTYxMTY4MTEyN30.' +
  'z0IcqyJ8k2XXUgAiZSglcRZ7zvU_kVInEBeHU1symcm8b0IBIMKoWwTrSu1X2xWzMExi90Io1DS7_Q-8m0nCpw';

const payload = {
  "microservice": "rpx_xui_approve-org",
  "oneTimePassword": "784467"
}

describe("/POST  Idam API lease", async() => {
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

  const RESPONSE_BODY:string = somethingLike("jwtTokenResponseString")

  // Setup the provider

  before(() => provider.setup())
  // Write Pact when all tests done
  after(() => provider.finalize())
  // verify with Pact, and reset expectations
  afterEach(() => provider.verify())
  describe("POST  /lease", () => {

    const jwt = 'some-access-token';

    before(done => {
      const interaction = {
        state: "a request for token",
        uponReceiving: "sidam respond with:",
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
            "Content-Type": "application/json",
          },
          body: s2sResponseSecret,
        },
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })
    it("returns the correct response", (done) => {

      const taskUrl = `${provider.mockService.baseUrl}/lease  `;
      const response = postLease(taskUrl,payload);

      response.then((axiosResponse) => {
        const idamResponse:string = axiosResponse.data;
        expect(idamResponse).to.be.equal(s2sResponseSecret);
      }).then(done,done)
    })
  })
})
