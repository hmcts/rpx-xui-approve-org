import { Pact } from '@pact-foundation/pact';
import {expect} from 'chai';
import * as getPort from 'get-port';
import * as path from 'path';
import {UserDetailsResponse} from '../../pactFixtures';
import {getAccountDetailsByAccountNumber} from "../../pactUtil";
const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

describe('Get Account Status for a Account Name', () => {

  let mockServerPort: number;
  let provider: Pact;
  const accountname:string = 'Account13254';

  before(async () => {
    mockServerPort = await getPort()
    provider = new Pact({
      consumer: 'XUIApproveOrg',
      log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
      dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
      logLevel: 'info',
      port: mockServerPort,
      provider: 'feeRegister_lookUp',
      spec: 2,
      pactfileWriteMode: "merge"
    })
    return provider.setup()
  })

  // Write Pact when all tests done
  after(() => provider.finalize())

  // verify with Pact, and reset expectations
  afterEach(() => provider.verify())

  let mockResponse={
      "account_name": somethingLike("solicitoraccount"),
      "account_number": somethingLike("123456"),
      "available_balance": somethingLike(122),
      "credit_limit": somethingLike(1000),
      "status": somethingLike("ACTIVE")
 }


  describe('Get Account Status for a Account Name', () => {
    before(done =>{
      const interaction = {
        state: 'Then a status message is returned',
        uponReceiving: 'A request to get Accounts based on account number',
        withRequest: {
          method: "GET",
          path:"/accounts/Account13254",
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
          body:mockResponse
        }
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })

    it('Returns the Account details retrieved for an Account by number', async () => {
      const taskUrl:string  = `${provider.mockService.baseUrl}/accounts/Account13254`;
      const resp =  getAccountDetailsByAccountNumber(taskUrl)
      resp.then((axResponse) => {
        expect(axResponse.status).to.be.equal(200);
        const responseDto:UserDetailsResponse  = <UserDetailsResponse> axResponse.data
        assertResponses(responseDto);
      })
    })
  })
})

function assertResponses(dto:UserDetailsResponse){
  expect(dto.account_name).to.be.equal('solicitoraccount');
  expect(dto.account_number).to.be.equal('123456');
  expect(dto.available_balance).to.be.equal(122);
  expect(dto.credit_limit).to.be.equal(1000);
  expect(dto.status).to.be.equal('ACTIVE');
}
