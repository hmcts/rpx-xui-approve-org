import { Pact } from '@pact-foundation/pact';
import {expect} from 'chai';
import * as getPort from 'get-port';
import * as path from 'path';
import {AssignAccessWithinOrganisationDto, CaseAssignmentResponseDto,OrganisationUsers} from "../../pactFixtures";
import {getOrganisationDeleteStatusRoute} from "../../pactUtil";
const {Matchers} = require('@pact-foundation/pact');
const {somethingLike} = Matchers;

describe('/GET Get Account Status for a Account Name', () => {

  let mockServerPort: number;
  let provider: Pact;
  const accountname:string = 'Account13254';

  before(async () => {
    mockServerPort = await getPort()
    provider = new Pact({
      consumer: 'XUIWebApp',
      log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
      dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
      logLevel: 'info',
      port: mockServerPort,
      provider: 'FeeAndPayApi', //TODO Check Provider.
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
      "account_name": somethingLike("bill.roberts@greatbrsolicitors.co.uk"),
      "account_number": somethingLike("bill"),
      "available_balance": somethingLike(122),
      "credit_limit": somethingLike(1000),
      "effective_date": somethingLike("2009-05-02"), //TODO change to matcher of format "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
      "status": somethingLike("ACTIVE")
 }


  describe('Get Account Status for a Account Name', () => {
    before(done =>{
      const interaction = {
        state: 'Then a status message is returned',
        uponReceiving: 'When Deleteable Status Route d to Users',
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
          }
        }
      }
      // @ts-ignore
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })

    it('Returns the Account details retrieved for an Account by number', async () => {
      const taskUrl:string  = `${provider.mockService.baseUrl}/accounts/Account13254`;
      const resp =  getOrganisationDeleteStatusRoute(taskUrl)

      resp.then((axResponse) => {
        expect(axResponse.status).to.be.equal(200);
      })
    })
  })
})
