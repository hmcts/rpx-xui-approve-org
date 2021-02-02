import {Pact} from '@pact-foundation/pact';
import {expect} from 'chai';
import * as getPort from 'get-port';
import * as path from 'path';
import {AccountDetailsResponse} from '../../../pactFixtures';
import {getOperation} from "../../../pactUtil";

const {Matchers} = require('@pact-foundation/pact');
const {somethingLike, like} = Matchers;

describe('Get Account Status for a Account Name', () => {

    let mockServerPort: number;
    let provider: Pact;
    const accountId = 'PBA1234'

    before(async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));

        mockServerPort = await getPort()
        provider = new Pact({
            consumer: 'xui_approveOrg',
            log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
            dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
            logLevel: 'error',
            port: mockServerPort,
            provider: 'payment_accounts',
            spec: 2,
            pactfileWriteMode: "merge"
        })
        return provider.setup()
    })

    // Write Pact when all tests done
    after(() => provider.finalize())

    // verify with Pact, and reset expectations
    afterEach(() => provider.verify())

    const responsePaymentAccount =
        {
            account_number: somethingLike("PBA1234"),
            account_name: somethingLike("account name"),
            credit_limit: like(20000.00),
            available_balance: like(20000.00),
            status: somethingLike("Active"),
            effective_date: somethingLike("2021-01-20T12:56:47.576Z")
        }


    describe('Get Account Status for a Account Name', () => {
        before(done => {
            const interaction = {
                state: 'An account exists with identifier PBA1234',
                uponReceiving: 'A request to for account PBA1234',
                withRequest: {
                    method: "GET",
                    path: "/accounts/" + accountId,
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
                    body: responsePaymentAccount
                }
            }
            // @ts-ignore
            provider.addInteraction(interaction).then(() => {
                done()
            })
        })

        it('Returns the Account details retrieved for an Account by number', async () => {
            const taskUrl: string = `${provider.mockService.baseUrl}/accounts/` + accountId;
            const resp = getOperation(taskUrl)
            resp.then((axResponse) => {
                expect(axResponse.status).to.be.equal(200);
                const responseDto: AccountDetailsResponse = <AccountDetailsResponse>axResponse.data
                assertResponse(responseDto);
            })
        })
    })
})

function assertResponse(dto: AccountDetailsResponse) {
    expect(dto.account_name).to.equal('account name');
    expect(dto.account_number).to.equal('PBA1234');

}

