import { expect } from 'chai';
import { AccountDetailsResponse } from '../../../pactFixtures';
import { getOperation } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';

const { Matchers } = require('@pact-foundation/pact');
const { somethingLike, like } = Matchers;
const pactSetUp = new PactTestSetup({ provider: 'payment_creditAccountPayment', port: 8000 });

// @ts-ignore
describe('Get Account Status for a Account Name', async () => {
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  const accountId = 'PBA1234';

  const responsePaymentAccount =
    {
      account_number: somethingLike('PBA1234'),
      account_name: somethingLike('account name'),
      credit_limit: like(20000.00),
      available_balance: like(20000.00),
      customer_reference: like('customerRef'),
      organisation_name: like('organisation'),
      site_id: like('ABA3'),
      status: somethingLike('Success'),
      status_histories: [
        {
          'date_updated': somethingLike('2020-10-06T12:55:48.685+0000'),
          'date_created': somethingLike('2020-10-06T12:54:48.585+0000'),
          'status': somethingLike('success')
        }
      ]
      // effective_date: somethingLike('2021-01-20T12:56:47.576Z')
    };

  describe('Get Account Status for a Account Name', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'An account exists with identifier PBA1234',
        uponReceiving: 'A request to for account PBA1234',
        withRequest: {
          method: 'GET',
          path: '/accounts/' + accountId,
          headers: {
            'Content-Type': 'application/json',
            'ServiceAuthorization': 'ServiceAuthToken',
            'Authorization': 'Bearer some-access-token'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: responsePaymentAccount
        }
      };
      // @ts-ignore
      pactSetUp.provider.addInteraction(interaction);
    });

    it('Returns the Account details retrieved for an Account by number', async () => {
      const taskUrl: string = `${pactSetUp.provider.mockService.baseUrl}/accounts/` + accountId;
      const resp = getOperation(taskUrl);
      resp.then((axResponse) => {
        expect(axResponse.status).to.be.equal(200);
        const responseDto: AccountDetailsResponse = <AccountDetailsResponse>axResponse.data;
        assertResponse(responseDto);
      }).then(() => {
        pactSetUp.provider.verify();
        pactSetUp.provider.finalize();
      }).finally(() => {
        pactSetUp.provider.verify();
        pactSetUp.provider.finalize();
      });
    });
  });
});

function assertResponse(dto: AccountDetailsResponse) {
  expect(dto.account_name).to.equal('account name');
  expect(dto.account_number).to.equal('PBA1234');
}
