import {Pact} from '@pact-foundation/pact';
import {expect} from 'chai';
import * as getPort from 'get-port';
import * as path from 'path';
import {delay} from 'rxjs/operators';
import {postOperation} from "../../../pactUtil";
import {UserAddedResponse} from "../../../pactFixtures"

const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

describe('Reinvite a User', () => {

    const orgnId = "UTVC86X";

    let mockServerPort: number;
    let provider: Pact;

    // @ts-ignore

    before(async () => {
        // @ts-ignore
        //delay(3000);
        await new Promise(resolve => setTimeout(resolve, 3000));

        mockServerPort = await getPort()
        provider = new Pact({
            consumer: 'xui_approveOrg',
            log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
            dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
            logLevel: 'info',
            port: mockServerPort,
            provider: 'referenceData_organisationalInternal',
            spec: 2,
            pactfileWriteMode: "merge"
        })
        return provider.setup()
    })

    // Write Pact when all tests done
    after(() => {
        provider.finalize()
        delay(3000)
    })

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

    describe('Reinvite User by adding the user to an organisation ', () => {
        before(done => {
            const interaction = {
                state: 'User invited to Organisation',
                uponReceiving: 'A Request to Reinvite user to the organisationd',
                withRequest: {
                    method: "POST",
                    path: "/refdata/internal/v1/organisations/" + orgnId + "/users/",
                    body: mockRequest,
                    headers: {
                        "Content-Type": "application/json",
                        "ServiceAuthorization": "ServiceAuthToken",
                        "Authorization": "Bearer some-access-token"
                    }
                },
                willRespondWith: {
                    status: 201
                }
            }
            // @ts-ignore
            provider.addInteraction(interaction).then(() => {
                done()
            })
        })

        it('Reinvite a user for an organisation', async () => {
            const taskUrl: string = `${provider.mockService.baseUrl}/refdata/internal/v1/organisations/` + orgnId + "/users/";

            const resp = postOperation(taskUrl, mockRequest)

            resp.then((response) => {
                try {
                    const responseDto: UserAddedResponse = <UserAddedResponse>response.data
                    expect(response.status).to.be.equal(201);
                } catch (e) {
                    console.log(`error occurred in asserting response...` + e)
                }
            })
        })
    })
})

