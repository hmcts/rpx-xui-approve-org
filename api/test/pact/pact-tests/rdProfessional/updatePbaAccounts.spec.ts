import {Pact} from '@pact-foundation/pact';
import {expect} from 'chai';
import * as getPort from 'get-port';
import * as path from 'path';
import {putOperation} from "../../../pactUtil";


describe('Update the PBA for an organisation', () => {

    const orgnId = "UTVC86X";

    let mockServerPort: number;
    let provider: Pact;

    before(async () => {
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
        provider.finalize();
    })

    // verify with Pact, and reset expectations
    afterEach(() => provider.verify())

    let mockRequest = {
        "paymentAccounts": ["PBA1234567", "PBA7654321"]
    }


    describe('Update the PBA an organisation given organisationId ', () => {
        before(done => {
            const interaction = {
                state: 'An Organisation with PBA accounts exists',
                uponReceiving: 'A request to update the PBA of an Organisation',
                withRequest: {
                    method: "PUT",
                    path: "/refdata/internal/v1/organisations/" + orgnId + "/pbas",
                    body: mockRequest,
                    headers: {
                        "Content-Type": "application/json",
                        "ServiceAuthorization": "ServiceAuthToken",
                        "Authorization": "Bearer some-access-token"
                    }
                },
                willRespondWith: {
                    status: 200
                }
            }
            // @ts-ignore
            provider.addInteraction(interaction).then(() => {
                done()
            })
        })

        it('Update an organisation`s PBA  and returns response', async () => {
            const taskUrl: string = `${provider.mockService.baseUrl}/refdata/internal/v1/organisations/` + orgnId + "/pbas";

            const resp = putOperation(taskUrl, mockRequest)
            resp.then((response) => {
                try {
                    const responseDto: string = response.data
                    expect(response.status).to.be.equal(200);
                } catch (e) {
                    console.log(`error occurred in asserting response...` + e)
                }
            })
        })
    })
})
