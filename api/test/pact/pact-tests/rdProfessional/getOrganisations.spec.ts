import { expect } from 'chai';
import { Organisation } from '../../../pactFixtures';
import { getOperation } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';

const { Matchers } = require('@pact-foundation/pact');
const { somethingLike } = Matchers;
const pactSetUp = new PactTestSetup({ provider: 'referenceData_organisationalInternal', port: 8000 });

describe('Get a list of organisations based on status', async () => {
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  describe('Get Organisations', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'Active organisations exists for a logged in user',
        uponReceiving: 'On receiving get Organisations',
        withRequest: {
          method: 'GET',
          path: '/refdata/internal/v1/organisations',
          query: 'status=Active',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer some-access-token',
            'ServiceAuthorization': 'ServiceAuthToken'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: { organisations }
        }
      };
      // @ts-ignore
      pactSetUp.provider.addInteraction(interaction);
    });

    it('Returns a list of organisations based on status', async () => {
      const path: string = `${pactSetUp.provider.mockService.baseUrl}/refdata/internal/v1/organisations?status=Active`;
      const resp = getOperation(path);
      resp.then((response) => {
        const responseDto: Organisation[] = <Organisation[]>response.data;
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

function assertResponse(dto: Organisation[]): void {
  // eslint-disable-next-line no-unused-expressions
  expect(dto).to.be.not.null;
  for (const element of dto) {
    expect(element.companyNumber).to.equal('A1000');
    expect(element.companyUrl).to.equal('www.google.com');
    expect(element.sraId).to.equal('sraId');
    expect(element.organisationIdentifier).to.equal('K100');
    expect(element.superUser.firstName).to.equal('Joe');
    expect(element.superUser.lastName).to.equal('Bloggs');
  }
}

const organisations = [
  {
    companyNumber: somethingLike('A1000'),
    companyUrl: somethingLike('www.google.com'),
    name: somethingLike('TheOrganisation'),
    organisationIdentifier: somethingLike('K100'),
    sraId: somethingLike('sraId'),
    sraRegulated: somethingLike(true),
    status: somethingLike('success'),
    superUser: {
      firstName: somethingLike('Joe'),
      lastName: somethingLike('Bloggs'),
      email: somethingLike('this@that.com')
    },
    paymentAccount: somethingLike(['abckd'])
  }
] as Organisation[];

