import {Pact} from '@pact-foundation/pact'
import {expect} from 'chai'
import * as path from 'path'
import * as getPort from "get-port";
import {postLease} from '../../../pactUtil';

const {Matchers} = require('@pact-foundation/pact');
const {string} = Matchers;

const s2sResponseSecret = 'someMicroServiceToken';

const payload = {
    "microservice": "rpx_xui_approve-org",
    "oneTimePassword": "784467"
}

describe("s2s API lease", async () => {
    let mockServerPort: number;
    let provider: Pact;

    before(async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));

        mockServerPort = await getPort()
        provider = new Pact({
            consumer: 'xui_approveOrg',
            log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
            dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
            logLevel: 'error',
            port: mockServerPort,
            provider: 's2s_auth',
            spec: 2,
            pactfileWriteMode: "merge"
        })
        return provider.setup()
    })

    // Write Pact when all tests done
    after(() => provider.finalize())

    // verify with Pact, and reset expectations
    afterEach(() => provider.verify())

    describe("POST  /lease", () => {

        const jwt = 'some-access-token';

        before(done => {
            const interaction = {
                state: "microservice with valid credentials",
                uponReceiving: "a request for a token for a microservice",
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
                        "Content-Type": "text/plain;charset=ISO-8859-1",
                    },
                    body: string(s2sResponseSecret),
                },
            }
            // @ts-ignore
            provider.addInteraction(interaction).then(() => {
                done()
            })
        })
        it("Returns the token from S2S Service", (done) => {

            const taskUrl = `${provider.mockService.baseUrl}/lease  `;
            const response = postLease(taskUrl, payload);

            response.then((axiosResponse) => {
                const idamResponse: string = axiosResponse.data;
               // expect(idamResponse).to.be.equal(s2sResponseSecret);
            }).then(done, done)
        })
    })
})
